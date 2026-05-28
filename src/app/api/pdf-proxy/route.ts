export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL não fornecida" }, { status: 400 });
    }

    // Se a URL for um caminho local (ex: /uploads/migracao/...)
    if (url.startsWith("/")) {
        try {
            const filePath = path.join(process.cwd(), "public", url);
            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                const ext = path.extname(filePath).toLowerCase();
                let contentType = "application/octet-stream";
                if (ext === ".pdf") contentType = "application/pdf";
                else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
                else if (ext === ".png") contentType = "image/png";

                return new NextResponse(fileBuffer, {
                    status: 200,
                    headers: {
                        "Content-Type": contentType,
                        "Content-Disposition": "inline",
                        "Cache-Control": "public, max-age=86400",
                    },
                });
            } else {
                return NextResponse.json({ error: "Arquivo local não encontrado" }, { status: 404 });
            }
        } catch (e) {
            console.error("Erro ao ler arquivo local:", e);
            return NextResponse.json({ error: "Erro ao ler arquivo local" }, { status: 500 });
        }
    }

    // Para URLs externas
    let targetUrl = url;
    let parsedUrl;
    try {
        parsedUrl = new URL(targetUrl);
    } catch (e) {
        return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return NextResponse.json({ error: "Protocolo não permitido" }, { status: 403 });
    }

    try {
        const response = await fetch(targetUrl);

        if (!response.ok) {
            return NextResponse.json({ error: "Arquivo não encontrado ou inacessível" }, { status: response.status });
        }

        const contentType = response.headers.get("content-type")?.toLowerCase() || "";
        const isPdfOrImage = contentType.includes("pdf") || contentType.includes("image/");
        const isOctetStream = contentType.includes("application/octet-stream") || contentType.includes("application/force-download") || contentType.includes("application/download");

        if (!isPdfOrImage && !isOctetStream) {
            console.warn(`Proxy interceptou tipo de conteúdo alternativo (${contentType}) para a URL: ${targetUrl}. Redirecionando iframe para a URL original.`);
            return NextResponse.redirect(targetUrl);
        }

        const buffer = await response.arrayBuffer();

        try {
            const textSample = new TextDecoder("utf-8").decode(buffer.slice(0, 1000));
            if (textSample.includes("<!DOCTYPE html") || textSample.includes("<html")) {
                const fullText = new TextDecoder("utf-8").decode(buffer);
                const driveUrlRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
                const driveOpenRegex = /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
                const driveIdConfigRegex = /['"]id['"]:\s*['"]([a-zA-Z0-9_-]{28,})['"]/;
                
                const match = fullText.match(driveUrlRegex) || fullText.match(driveOpenRegex) || fullText.match(driveIdConfigRegex);
                if (match && match[1]) {
                    const driveId = match[1];
                    const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
                    return NextResponse.redirect(previewUrl);
                }
            }
        } catch (e) {
            console.error("Erro ao analisar arquivo como HTML do Google Drive:", e);
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType.includes("pdf") ? "application/pdf" : contentType,
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error) {
        console.error("Erro ao fazer proxy do PDF:", error);
        return NextResponse.json({ error: "Erro ao carregar arquivo" }, { status: 500 });
    }
}
