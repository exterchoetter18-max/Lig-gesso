"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createQuote(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) return;

  const projectId = String(formData.get("projectId") ?? "") || null;
  const validityDays = Number(formData.get("validityDays") ?? 30) || 30;
  const deliveryTerm =
    String(formData.get("deliveryTerm") ?? "").trim() || "A combinar";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const descriptions = formData.getAll("itemDescription").map(String);
  const values = formData.getAll("itemValue").map(String);

  const items = descriptions
    .map((description, i) => ({
      description: description.trim(),
      value: Number(values[i]),
    }))
    .filter((item) => item.description && item.value > 0);

  if (items.length === 0) return;

  const quote = await prisma.quote.create({
    data: {
      clientId,
      projectId,
      validityDays,
      deliveryTerm,
      notes,
      items: {
        create: items.map((item, order) => ({ ...item, order })),
      },
    },
  });

  revalidatePath("/documentos");
  redirect(`/orcamentos/${quote.id}`);
}

export async function deleteQuote(id: string) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/documentos");
}
