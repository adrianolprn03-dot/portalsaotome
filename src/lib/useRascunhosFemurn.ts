"use client";

import { useEffect, useState } from "react";

export type RascunhosFemurnCounts = {
    legislacao: number;
    diarias: number;
};

/**
 * Retorna as contagens de rascunhos da FEMURN aguardando aprovação
 * em Legislação e Atos e em Diárias de Viagem.
 */
export function useRascunhosFemurnDetalhes(enabled = true, refreshKey?: unknown): RascunhosFemurnCounts {
    const [counts, setCounts] = useState<RascunhosFemurnCounts>({ legislacao: 0, diarias: 0 });

    useEffect(() => {
        if (!enabled) {
            setCounts({ legislacao: 0, diarias: 0 });
            return;
        }
        let ativo = true;
        const carregar = async () => {
            try {
                const res = await fetch("/api/admin/legislacao/rascunhos-femurn", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (ativo) {
                    setCounts({
                        legislacao: typeof data.legislacao === "number" ? data.legislacao : (typeof data.total === "number" ? data.total : 0),
                        diarias: typeof data.diarias === "number" ? data.diarias : 0,
                    });
                }
            } catch {
                /* mantém o último valor */
            }
        };
        carregar();
        const timer = setInterval(carregar, 60_000);
        const onFocus = () => carregar();
        window.addEventListener("focus", onFocus);
        return () => {
            ativo = false;
            clearInterval(timer);
            window.removeEventListener("focus", onFocus);
        };
    }, [enabled, refreshKey]);

    return counts;
}

/**
 * Retorna quantos atos da FEMURN estão em rascunho aguardando aprovação em Legislação.
 */
export function useRascunhosFemurn(enabled = true, refreshKey?: unknown) {
    return useRascunhosFemurnDetalhes(enabled, refreshKey).legislacao;
}
