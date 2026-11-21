export const AMERICA_FORTALEZA_TZ = "America/Fortaleza";

/**
 * Retorna a data no formato YYYY-MM-DD respeitando o fuso America/Fortaleza (UTC-3).
 */
export function getFortalezaDateISO(input: Date | string = new Date()): string {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: AMERICA_FORTALEZA_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(d);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    if (!year || !month || !day) return "";
    return `${year}-${month}-${day}`;
}

/**
 * Converte uma string de data (YYYY-MM-DD ou ISO) para o fim do dia (23:59:59.999)
 * no fuso America/Fortaleza (-03:00), garantindo que um aviso válido até DD/MM/AAAA
 * permaneça vigente durante todo o dia DD/MM/AAAA no horário local do RN.
 */
export function parseEndOfDayFortaleza(dateInput?: string | Date | null): Date | null {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return Number.isNaN(dateInput.getTime()) ? null : dateInput;
    }
    const trimmed = String(dateInput).trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const d = new Date(`${trimmed}T23:59:59.999-03:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Verifica se um aviso com prazo (validoAte) ainda está vigente no fuso America/Fortaleza.
 * Se validoAte não estiver preenchido, o aviso é considerado vigente enquanto publicado.
 * Se validoAte estiver preenchido, permanece vigente até 23:59:59 do dia final em America/Fortaleza.
 */
export function isAvisoVigente(
    validoAte?: Date | string | null,
    referenceNow: Date = new Date()
): boolean {
    if (!validoAte) return true;
    const targetDateISO = getFortalezaDateISO(validoAte);
    const todayISO = getFortalezaDateISO(referenceNow);
    if (!targetDateISO || !todayISO) return false;
    return targetDateISO >= todayISO;
}

/**
 * Formata uma data no padrão brasileiro respeitando o fuso America/Fortaleza.
 */
export function formatDateFortaleza(
    input?: Date | string | null,
    style: "short" | "medium" | "long" = "medium"
): string {
    if (!input) return "";
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "";

    if (style === "short") {
        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: AMERICA_FORTALEZA_TZ,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(d);
    }

    if (style === "long") {
        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: AMERICA_FORTALEZA_TZ,
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(d);
    }

    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: AMERICA_FORTALEZA_TZ,
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
        .format(d)
        .replace(/ de /g, " ");
}
