"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@prisma/client";

export async function createProject(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "");
  if (!title || !clientId) return;

  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");

  await prisma.project.create({
    data: {
      title,
      clientId,
      description: String(formData.get("description") ?? "").trim() || null,
      budget: budgetRaw ? Number(budgetRaw) : null,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
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

  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");

  await prisma.project.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      budget: budgetRaw ? Number(budgetRaw) : null,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
    },
  });

  revalidatePath(`/pedidos/${id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/pedidos");
  redirect("/pedidos");
}
