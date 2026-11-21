import { prisma } from "@/lib/prisma";
import GlossarioClientPage from "./GlossarioClientPage";

export const revalidate = 300;

export const metadata = {
  title: "Glossário | Prefeitura de São Tomé",
  description: "Dicionário de termos técnicos da administração pública municipal.",
};

export default async function GlossarioPage() {
  const termos = await prisma.glossario.findMany({
    orderBy: { termo: "asc" }
  });

  return <GlossarioClientPage initialData={termos} />;
}
