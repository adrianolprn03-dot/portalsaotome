import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const maxPdf = 4 * 1024 * 1024;
const codigo = z.string().regex(/^[A-F0-9]{8}$/);
const checksum = z.string().regex(/^[a-f0-9]{32}$/);
const date = z.string().date();
const documento = z.object({
    codigo,
    checksum_md5: checksum,
    tipo: z.enum(["LEI", "DECRETO", "PORTARIA", "PORTARIA_DIARIA"]),
    numero: z.string().regex(/^\d{0,9}$/),
    data_ato: z.union([date, z.literal("")]),
    publicado_em: date,
    ementa: z.string().trim().max(4000),
    orgao: z.string().trim().min(1).max(250),
    edicao: z.string().regex(/^\d{1,12}$/),
});

function json(data: object, status = 200) {
    return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function limparToken(valor: string) {
    return valor
        .trim()
        .replace(/^["']+|["']+$/g, "")
        .trim()
        .replace(/^(?:Bearer\s+)+/i, "")
        .trim()
        .replace(/^["']+|["']+$/g, "")
        .trim();
}

function autorizar(req: Request) {
    const token = limparToken(process.env.FEMURN_INTEGRATION_TOKEN ?? "");
    if (!token || token.length < 32) return json({ erro: "Integração indisponível" }, 503);
    const authHeader = (req.headers.get("authorization") ?? "").trim();
    if (!/^Bearer\s+/i.test(authHeader)) {
        return json({ erro: "Não autorizado" }, 401);
    }
    const recebido = limparToken(authHeader);
    const digest = (value: string) => createHash("sha256").update(value).digest();
    if (!recebido || !timingSafeEqual(digest(recebido), digest(token))) {
        return json({ erro: "Não autorizado" }, 401);
    }
}

async function consultar(cod: string) {
    return prisma.legislacaoFemurn.findUnique({
        where: { codigo: cod },
        select: { legislacaoId: true, checksumMd5: true },
    });
}

function existente(registro: NonNullable<Awaited<ReturnType<typeof consultar>>>, md5: string) {
    if (registro.checksumMd5 === md5) {
        return json({ ok: true, processar: false, resultado: "ja_processado", id: registro.legislacaoId });
    }
    return json({ processar: false, conflito: true, resultado: "conflito_revisao", id: registro.legislacaoId });
}

export async function GET(req: Request) {
    const denied = autorizar(req);
    if (denied) return denied;
    const params = new URL(req.url).searchParams;
    const cod = codigo.safeParse(params.get("codigo"));
    const rawMd5 = params.get("checksum_md5");
    if (!cod.success) return json({ erro: "Código ou checksum inválido" }, 400);
    if (rawMd5 !== null && rawMd5 !== "") {
        const md5 = checksum.safeParse(rawMd5);
        if (!md5.success) return json({ erro: "Código ou checksum inválido" }, 400);
        const registro = await consultar(cod.data);
        return registro ? existente(registro, md5.data) : json({ processar: true });
    }
    const registro = await consultar(cod.data);
    return registro
        ? json({ ok: true, processar: false, resultado: "ja_processado", id: registro.legislacaoId, checksum_md5: registro.checksumMd5 })
        : json({ processar: true });
}

export async function POST(req: Request) {
    const denied = autorizar(req);
    if (denied) return denied;
    const contentType = req.headers.get("content-type") ?? "";
    if (!req.body || !contentType.startsWith("multipart/form-data;")) {
        return json({ erro: "Envie documento e arquivo em multipart/form-data" }, 415);
    }
    let bytes = 0;
    const maxRequest = maxPdf + 64 * 1024;
    const body = req.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
            bytes += chunk.byteLength;
            if (bytes > maxRequest) throw new Error("Limite de requisição");
            controller.enqueue(chunk);
        },
    }));
    let form: FormData;
    let metadados: unknown;
    try {
        form = await new Response(body, { headers: { "Content-Type": contentType } }).formData();
        const raw = form.get("documento");
        if (typeof raw !== "string") return json({ erro: "Metadados ausentes" }, 400);
        metadados = JSON.parse(raw);
    } catch {
        return json({ erro: "Formulário inválido ou acima do limite" }, bytes > maxRequest ? 413 : 400);
    }
    const parsed = documento.safeParse(metadados);
    const arquivo = form.get("arquivo");
    if (!parsed.success || !arquivo || typeof arquivo === "string") return json({ erro: "Informe os metadados e o PDF" }, 422);
    if (arquivo.size > maxPdf) return json({ erro: "PDF acima de 4 MiB" }, 413);
    const doc = parsed.data;
    if (doc.data_ato > doc.publicado_em) return json({ erro: "Data do ato posterior à publicação" }, 422);
    const pdf = Buffer.from(await arquivo.arrayBuffer());
    if (pdf.subarray(0, 5).toString("ascii") !== "%PDF-" || createHash("md5").update(pdf).digest("hex") !== doc.checksum_md5) {
        return json({ erro: "PDF ou checksum inválido" }, 422);
    }

    const atual = await consultar(doc.codigo);
    if (atual) return existente(atual, doc.checksum_md5);
    const tipo = doc.tipo.toLowerCase();
    const ano = Number((doc.data_ato || doc.publicado_em).slice(0, 4));
    try {
        return await prisma.$transaction(async (tx) => {
            if (doc.numero) {
                const candidatos = await tx.legislacao.findMany({
                    where: { ano, tipo: { equals: tipo, mode: "insensitive" } },
                    select: { id: true, numero: true },
                });
                const coincidencia = candidatos.find((ato) => {
                    const digitos = /^\s*(\d+)(?:\s*[/\-]\s*\d{4})?\s*$/.exec(ato.numero)?.[1];
                    return digitos && Number(digitos) === Number(doc.numero);
                });
                if (coincidencia) return json({ processar: false, conflito: true, resultado: "conflito_revisao", id: coincidencia.id });
            }
            const ato = await tx.legislacao.create({
                data: {
                    tipo, ano, numero: doc.numero, ementa: doc.ementa,
                    dataAto: doc.data_ato ? new Date(doc.data_ato) : null,
                    arquivo: "/api/legislacao/femurn/" + doc.codigo,
                    ativo: false,
                    femurn: { create: {
                        codigo: doc.codigo, checksumMd5: doc.checksum_md5,
                        publicadoEm: new Date(doc.publicado_em), orgao: doc.orgao, edicao: doc.edicao, pdf,
                    } },
                },
                select: { id: true },
            });
            return json({ ok: true, resultado: "criado", id: ato.id }, 201);
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
            const registro = await consultar(doc.codigo);
            if (registro) return existente(registro, doc.checksum_md5);
            return json({ erro: "Gravação concorrente. Execute novamente." }, 409);
        }
        console.error("Falha na importação FEMURN", doc.codigo, error instanceof Error ? error.name : "Erro");
        return json({ erro: "Falha na importação FEMURN" }, 500);
    }
}
