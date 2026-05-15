/**
 * Módulo de compatibilidade: anteriormente usava Cloudflare R2.
 * Agora delega para Vercel Blob Storage.
 * Os imports em outras rotas (deleteFileFromR2) continuam funcionando sem mudança.
 */
import { del } from "@vercel/blob";

/**
 * Deleta um arquivo do Vercel Blob a partir da sua URL pública.
 * Falha silenciosamente para não bloquear a exclusão do registro no banco.
 */
export async function deleteFileFromR2(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  // Não tenta deletar URLs locais ou do site antigo
  if (fileUrl.startsWith("/") || fileUrl.includes("saotome.rn.gov.br")) {
    console.warn(`⚠️ Storage: URL local ou legada, ignorando delete: ${fileUrl}`);
    return;
  }

  try {
    await del(fileUrl);
    console.log(`🗑️ Blob: Arquivo removido com sucesso: ${fileUrl}`);
  } catch (error: any) {
    console.error(`❌ Blob: Erro ao deletar arquivo ${fileUrl}:`, error.message);
    // Não relança o erro para não bloquear a exclusão do registro
  }
}
