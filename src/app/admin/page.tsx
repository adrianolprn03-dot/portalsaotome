import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role || "admin";

    // Contadores do banco
    let counts = { 
        noticia: 0, 
        licitacao: 0, 
        contrato: 0, 
        convenio: 0, 
        diaria: 0, 
        servidor: 0, 
        ouvidoria: 0, 
        contato: 0, 
        obra: 0, 
        faq: 0, 
        glossario: 0, 
        legislacao: 0, 
        unidades: 0 
    };

    try {
        const [
            noticia, 
            licitacao, 
            contrato, 
            convenio, 
            diaria, 
            servidor, 
            ouvidoria, 
            contato, 
            obra, 
            faq, 
            glossario, 
            legislacao, 
            unidades
        ] = await Promise.all([
            prisma.noticia.count(),
            prisma.licitacao.count(),
            prisma.contrato.count(),
            prisma.convenio.count(),
            prisma.diaria.count(),
            prisma.servidor.count(),
            prisma.ouvidoria.count({ where: { status: "aberto" } }),
            prisma.contato.count({ where: { respondido: false } }),
            prisma.obra.count(),
            prisma.fAQ.count(),
            prisma.glossario.count(),
            prisma.legislacao.count(),
            prisma.unidadeAtendimento.count(),
        ]);
        
        counts = { 
            noticia, 
            licitacao, 
            contrato, 
            convenio, 
            diaria, 
            servidor, 
            ouvidoria, 
            contato, 
            obra, 
            faq, 
            glossario, 
            legislacao, 
            unidades 
        };
    } catch (error) {
        console.error("Erro ao carregar contadores do dashboard:", error);
    }

    // Carregar dados de atividade recente
    let ultimasNoticias: any[] = [];
    let ultimasObras: any[] = [];
    let ultimasFAQs: any[] = [];

    try {
        const [noticiasData, obrasData, faqsData] = await Promise.all([
            prisma.noticia.findMany({
                take: 4,
                orderBy: { criadoEm: "desc" },
                select: { id: true, titulo: true, criadoEm: true, publicada: true }
            }),
            prisma.obra.findMany({
                take: 4,
                orderBy: { criadoEm: "desc" },
                select: { id: true, titulo: true, criadoEm: true, status: true }
            }),
            prisma.fAQ.findMany({
                take: 4,
                orderBy: { criadoEm: "desc" },
                select: { id: true, pergunta: true, criadoEm: true }
            })
        ]);
        
        ultimasNoticias = noticiasData;
        ultimasObras = obrasData;
        ultimasFAQs = faqsData;
    } catch (error) {
        console.error("Erro ao carregar dados de atividades recentes:", error);
    }

    return (
        <DashboardClient
            session={session}
            role={role}
            counts={counts}
            ultimasNoticias={ultimasNoticias}
            ultimasObras={ultimasObras}
            ultimasFAQs={ultimasFAQs}
        />
    );
}
