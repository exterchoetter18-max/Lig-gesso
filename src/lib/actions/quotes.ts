"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseQuoteFields(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const projectId = String(formData.get("projectId") ?? "") || null;
  const validityDays = Number(formData.get("validityDays") ?? 30) || 30;
  const deliveryTerm =
    String(formData.get("deliveryTerm") ?? "").trim() || "A combinar";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const discountType: DiscountType =
    formData.get("discountType") === "PERCENTUAL" ? "PERCENTUAL" : "VALOR";
  const rawDiscount = Math.max(Number(formData.get("discount") ?? 0) || 0, 0);
  const discount =
    discountType === "PERCENTUAL" ? Math.min(rawDiscount, 100) : rawDiscount;

  const descriptions = formData.getAll("itemDescription").map(String);
  const values = formData.getAll("itemValue").map(String);

  const items = descriptions
    .map((description, i) => ({
      description: description.trim(),
      value: Number(values[i]),
    }))
    .filter((item) => item.description && item.value > 0);

  return {
    clientId,
    projectId,
    validityDays,
    deliveryTerm,
    notes,
    discount,
    discountType,
    items,
  };
}

export async function createQuote(formData: FormData) {
  const { items, ...fields } = parseQuoteFields(formData);

  if (!fields.clientId || items.length === 0) return;

  const quote = await prisma.quote.create({
    data: {
      ...fields,
      items: {
        create: items.map((item, order) => ({ ...item, order })),
      },
    },
  });

  revalidatePath("/documentos");
  redirect(`/orcamentos/${quote.id}`);
}

export async function updateQuote(id: string, formData: FormData) {
  const { items, ...fields } = parseQuoteFields(formData);

  if (!fields.clientId || items.length === 0) return;

  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
    prisma.quote.update({
      where: { id },
      data: {
        ...fields,
        items: {
          create: items.map((item, order) => ({ ...item, order })),
        },
      },
    }),
  ]);

  revalidatePath("/documentos");
  revalidatePath(`/orcamentos/${id}`);
  redirect(`/orcamentos/${id}`);
}

export async function deleteQuote(id: string) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/documentos");
}
