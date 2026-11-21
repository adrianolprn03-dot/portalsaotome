import { formatDateFortaleza, isAvisoVigente } from "@/lib/timezone";

export interface NoticiaPublicaItem {
    id: string;
    titulo: string;
    slug: string;
    resumo: string;
    imagem: string | null;
    tipoPublicacao?: string | null;
    validoAte?: Date | string | null;
    publicada: boolean;
    destaque: boolean;
    publicadoEm: Date | string | null;
    criadoEm: Date | string;
    secretaria?: { nome: string; slug?: string } | null;
}

export interface HomeNoticiasSelection {
    avisosVigentes: Array<
        NoticiaPublicaItem & {
            dataPublicacaoFmt: string;
            validoAteFmt: string | null;
        }
    >;
    principal: (NoticiaPublicaItem & { dataPublicacaoFmt: string }) | null;
    secundarias: Array<NoticiaPublicaItem & { dataPublicacaoFmt: string }>;
}

/**
 * Seleciona publicações reais para a seção "Notícias e avisos" da Home:
 * - Exclui rascunhos (publicada === false)
 * - Para avisos com prazo (tipoPublicacao === "aviso"), exibe no destaque de avisos
 *   somente enquanto vigentes no fuso America/Fortaleza, retirando automaticamente ao vencer
 * - Escolhe 1 notícia principal (priorizando 'destaque: true', ou a publicação mais recente caso não haja destaque)
 * - Escolhe até 2 chamadas secundárias
 */
export function selectHomeNoticiasAndAvisos(
    rawItems: NoticiaPublicaItem[],
    now: Date = new Date()
): HomeNoticiasSelection {
    const publicadas = (rawItems || []).filter((item) => item && item.publicada === true);

    const getTimestamp = (item: NoticiaPublicaItem) => {
        const d = new Date(item.publicadoEm || item.criadoEm);
        return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const sorted = [...publicadas].sort((a, b) => getTimestamp(b) - getTimestamp(a));

    const avisosVigentes = sorted
        .filter((item) => {
            if (item.tipoPublicacao !== "aviso") return false;
            return isAvisoVigente(item.validoAte, now);
        })
        .map((item) => ({
            ...item,
            dataPublicacaoFmt: formatDateFortaleza(item.publicadoEm || item.criadoEm, "medium"),
            validoAteFmt: item.validoAte ? formatDateFortaleza(item.validoAte, "short") : null,
        }));

    // Candidatas a notícias editoriais: exclui avisos já exibidos na faixa de avisos e exclui avisos vencidos
    const avisoVigenteIds = new Set(avisosVigentes.map((a) => a.id));
    const noticiasCandidatas = sorted.filter((item) => {
        if (avisoVigenteIds.has(item.id)) return false;
        if (item.tipoPublicacao === "aviso" && !isAvisoVigente(item.validoAte, now)) {
            // Aviso vencido sai automaticamente do destaque da home (continua no histórico /noticias)
            return false;
        }
        return true;
    });

    if (noticiasCandidatas.length === 0) {
        return {
            avisosVigentes,
            principal: null,
            secundarias: [],
        };
    }

    // Prioriza notícia marcada como destaque (se houver mais de uma, prioriza a mais recente com imagem ou a mais recente)
    const marcadasDestaque = noticiasCandidatas.filter((n) => n.destaque === true);
    let escolhidaPrincipal: NoticiaPublicaItem;

    if (marcadasDestaque.length > 0) {
        const destaqueComFoto = marcadasDestaque.find((n) => Boolean(n.imagem && n.imagem.trim()));
        escolhidaPrincipal = destaqueComFoto || marcadasDestaque[0];
    } else {
        // Fallback: se não houver notícia marcada como destaque, usa a publicação mais recente
        escolhidaPrincipal = noticiasCandidatas[0];
    }

    const principal = {
        ...escolhidaPrincipal,
        dataPublicacaoFmt: formatDateFortaleza(
            escolhidaPrincipal.publicadoEm || escolhidaPrincipal.criadoEm,
            "medium"
        ),
    };

    const secundarias = noticiasCandidatas
        .filter((n) => n.id !== principal.id)
        .slice(0, 2)
        .map((n) => ({
            ...n,
            dataPublicacaoFmt: formatDateFortaleza(n.publicadoEm || n.criadoEm, "medium"),
        }));

    return {
        avisosVigentes,
        principal,
        secundarias,
    };
}
