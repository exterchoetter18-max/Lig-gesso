"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseContractFields(formData: FormData) {
  const workAddress = String(formData.get("workAddress") ?? "").trim();
  const deliveryTerm = String(formData.get("deliveryTerm") ?? "").trim();
  const downPayment = Number(formData.get("downPayment") ?? 0) || 0;
  const paymentMethod =
    String(formData.get("paymentMethod") ?? "").trim() || "Pix ou dinheiro";
  // Meio-dia evita que a data "volte" um dia por causa do fuso horário.
  const dateValue = String(formData.get("date") ?? "");
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();

  return {
    workAddress,
    deliveryTerm,
    downPayment: downPayment > 0 ? downPayment : null,
    paymentMethod,
    date: Number.isNaN(date.getTime()) ? new Date() : date,
  };
}

export async function createContract(quoteId: string, formData: FormData) {
  const fields = parseContractFields(formData);
  if (!fields.workAddress || !fields.deliveryTerm) return;

  const contract = await prisma.contract.create({
    data: { quoteId, ...fields },
  });

  revalidatePath("/documentos");
  redirect(`/contratos/${contract.id}`);
}

export async function updateContract(id: string, formData: FormData) {
  const fields = parseContractFields(formData);
  if (!fields.workAddress || !fields.deliveryTerm) return;

  await prisma.contract.update({ where: { id }, data: fields });

  revalidatePath("/documentos");
  revalidatePath(`/contratos/${id}`);
  redirect(`/contratos/${id}`);
}

export async function deleteContract(id: string) {
  await prisma.contract.delete({ where: { id } });
  revalidatePath("/documentos");
}
