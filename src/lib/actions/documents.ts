"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, DOCUMENTS_BUCKET } from "@/lib/supabase";

export async function createDocument(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const clientId = String(formData.get("clientId") ?? "") || null;
  const projectId = String(formData.get("projectId") ?? "") || null;

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const storagePath = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error } = await getSupabaseAdmin()
    .storage.from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha ao enviar arquivo: ${error.message}`);
  }

  await prisma.document.create({
    data: {
      name: file.name,
      fileUrl: storagePath,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      clientId,
      projectId,
    },
  });

  revalidatePath("/documentos");
  if (clientId) revalidatePath(`/clientes/${clientId}`);
  if (projectId) revalidatePath(`/pedidos/${projectId}`);
}

export async function deleteDocument(
  id: string,
  storagePath: string,
  opts?: { clientId?: string | null; projectId?: string | null },
) {
  await prisma.document.delete({ where: { id } });

  await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove([storagePath]);

  revalidatePath("/documentos");
  if (opts?.clientId) revalidatePath(`/clientes/${opts.clientId}`);
  if (opts?.projectId) revalidatePath(`/pedidos/${opts.projectId}`);
}
