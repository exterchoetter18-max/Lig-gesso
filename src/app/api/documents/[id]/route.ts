import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, DOCUMENTS_BUCKET } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin()
    .storage.from(DOCUMENTS_BUCKET)
    .download(document.fileUrl);

  if (error || !data) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(document.name)}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
