import { put, del } from "@vercel/blob";

/**
 * Faz upload de um arquivo para o Vercel Blob Storage.
 * Retorna a URL pública do arquivo.
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const { url } = await put(filename, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return url;
}

/**
 * Deleta um arquivo do Vercel Blob a partir da sua URL pública.
 * Falha silenciosamente para não bloquear exclusão de registros no banco.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  // Apenas tenta deletar se for uma URL do Vercel Blob
  if (!fileUrl.includes("vercel-storage.com") && !fileUrl.includes("blob.vercel")) {
    console.warn(`⚠️ Storage: URL não é do Vercel Blob, ignorando delete: ${fileUrl}`);
    return;
  }
  try {
    await del(fileUrl);
    console.log(`🗑️ Blob: Arquivo removido: ${fileUrl}`);
  } catch (error: any) {
    console.error(`❌ Blob: Erro ao deletar ${fileUrl}:`, error.message);
  }
}
