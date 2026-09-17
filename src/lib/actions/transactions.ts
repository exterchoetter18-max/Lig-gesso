"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TransactionType } from "@prisma/client";

export async function createTransaction(formData: FormData) {
  const type = String(formData.get("type") ?? "") as TransactionType;
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const dateRaw = String(formData.get("date") ?? "");
  const projectId = String(formData.get("projectId") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!type || !category || !amount || amount <= 0) return;

  await prisma.transaction.create({
    data: {
      type,
      category,
      amount,
      date: dateRaw ? new Date(dateRaw) : new Date(),
      projectId,
      description,
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/pedidos/${projectId}`);
}

export async function deleteTransaction(id: string, projectId?: string | null) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/pedidos/${projectId}`);
}
