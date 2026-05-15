export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import sharp from "sharp";

// Tipos de imagem que serão comprimidos para WebP
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"];

// Largura máxima para redimensionamento (preserva aspecto)
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let contentType = file.type;
    const originalSize = buffer.length;

    // Gera um nome limpo para o arquivo
    const safeName = file.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9.]/g, "_")
      .replace(/_+/g, "_");

    let finalName: string;

    // Se for imagem, comprimir com Sharp e converter para WebP
    if (IMAGE_TYPES.includes(file.type)) {
      const nameWithoutExt = safeName.replace(/\.[^.]+$/, "");
      finalName = `uploads/${nameWithoutExt}.webp`;

      buffer = Buffer.from(
        await sharp(buffer)
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer()
      );

      contentType = "image/webp";

      const savings = ((1 - buffer.length / originalSize) * 100).toFixed(1);
      console.log(`🖼️ Imagem comprimida: ${(originalSize / 1024).toFixed(0)}KB → ${(buffer.length / 1024).toFixed(0)}KB (${savings}% menor)`);
    } else {
      // PDFs e outros arquivos — salva como está
      finalName = `uploads/${safeName}`;
    }

    // Faz o upload para o Vercel Blob
    const publicUrl = await uploadFile(buffer, finalName, contentType);

    console.log(`✅ Arquivo salvo no Vercel Blob: ${publicUrl}`);
    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("❌ Erro no upload:", error);
    return NextResponse.json({
      error: "Erro no servidor ao realizar upload",
      details: error.message
    }, { status: 500 });
  }
}
