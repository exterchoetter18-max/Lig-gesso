"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.client.create({
    data: {
      name,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/clientes");
}

export async function updateClient(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.client.update({
    where: { id },
    data: {
      name,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteClient(id: string) {
  const projectCount = await prisma.project.count({ where: { clientId: id } });
  if (projectCount > 0) {
    redirect(`/clientes/${id}?error=has-projects`);
  }

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clientes");
  redirect("/clientes");
}
