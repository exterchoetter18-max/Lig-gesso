"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@prisma/client";

function parseProjectFields(formData: FormData) {
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const downPaymentRaw = String(formData.get("downPayment") ?? "").trim();
  const installmentsRaw = String(formData.get("installments") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");

  return {
    description: String(formData.get("description") ?? "").trim() || null,
    budget: budgetRaw ? Number(budgetRaw) : null,
    downPayment: downPaymentRaw ? Number(downPaymentRaw) : null,
    installments: installmentsRaw ? Number(installmentsRaw) : null,
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    endDate: endDateRaw ? new Date(endDateRaw) : null,
  };
}

export async function createProject(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "");
  if (!title || !clientId) return;

  await prisma.project.create({
    data: {
      title,
      clientId,
      ...parseProjectFields(formData),
    },
  });

  revalidatePath("/pedidos");
}

export async function updateProjectStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "") as ProjectStatus;
  await prisma.project.update({ where: { id }, data: { status } });
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await prisma.project.update({
    where: { id },
    data: {
      title,
      ...parseProjectFields(formData),
    },
  });

  revalidatePath(`/pedidos/${id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/pedidos");
  redirect("/pedidos");
}
