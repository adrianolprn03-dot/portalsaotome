import {
    Building2,
    HeartPulse,
    GraduationCap,
    HardHat,
    Sprout,
    HandHeart,
    Receipt,
    Scale,
    Bus,
    Palette,
    Landmark,
    ShieldCheck,
    Users,
    Briefcase,
    Coins,
    Globe,
    type LucideIcon,
} from "lucide-react";

export function getSecretariaIcon(nome: string): LucideIcon {
    if (!nome) return Building2;
    const n = nome.toLowerCase();
    if (n.includes("saúde") || n.includes("saude")) return HeartPulse;
    if (n.includes("educação") || n.includes("educacao")) return GraduationCap;
    if (n.includes("cultura") || n.includes("turismo") || n.includes("esporte") || n.includes("lazer")) return Palette;
    if (n.includes("obras") || n.includes("infraestrutura") || n.includes("urbanismo") || n.includes("serviços urbanos")) return HardHat;
    if (n.includes("agricultura") || n.includes("meio ambiente") || n.includes("recursos hídricos") || n.includes("pesca")) return Sprout;
    if (n.includes("social") || n.includes("trabalho") || n.includes("habitação") || n.includes("cidadania")) return HandHeart;
    if (n.includes("finanças") || n.includes("financas") || n.includes("tributação") || n.includes("tributacao") || n.includes("fazenda")) return Coins;
    if (n.includes("procuradoria") || n.includes("jurídico") || n.includes("juridico")) return Scale;
    if (n.includes("transporte") || n.includes("trânsito") || n.includes("transito") || n.includes("mobilidade")) return Bus;
    if (n.includes("gabinete") || n.includes("prefeito") || n.includes("governo")) return Landmark;
    if (n.includes("controladoria") || n.includes("controle")) return ShieldCheck;
    if (n.includes("administração") || n.includes("administracao") || n.includes("planejamento")) return Briefcase;
    if (n.includes("mulher") || n.includes("juventude") || n.includes("direitos")) return Users;
    if (n.includes("comunicação") || n.includes("comunicacao")) return Globe;
    if (n.includes("receita") || n.includes("orçamento")) return Receipt;

    return Building2;
}
