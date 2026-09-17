"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createAppointment(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");
  if (!title || !dateRaw) return;

  const clientId = String(formData.get("clientId") ?? "") || null;
  const projectId = String(formData.get("projectId") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.appointment.create({
    data: {
      title,
      date: new Date(dateRaw),
      clientId,
      projectId,
      notes,
    },
  });

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/pedidos/${projectId}`);
}

export async function deleteAppointment(id: string, projectId?: string | null) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/pedidos/${projectId}`);
}
