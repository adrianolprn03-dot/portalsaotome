"use client";

import { useEffect, useState } from "react";

/**
 * Retorna quantos atos da FEMURN estão em rascunho aguardando aprovação.
 * Atualiza ao montar, a cada 60s e ao voltar o foco para a aba.
 * Retorna 0 quando o usuário não tem acesso ou a consulta falha.
 */
export function useRascunhosFemurn(enabled = true, refreshKey?: unknown) {
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!enabled) {
            setTotal(0);
            return;
        }
        let ativo = true;
        const carregar = async () => {
            try {
                const res = await fetch("/api/admin/legislacao/rascunhos-femurn", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (ativo && typeof data.total === "number") setTotal(data.total);
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

    return total;
}
