"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { MovementType } from "@prisma/client";

export async function createMaterial(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  if (!name || !unit) return;

  const quantity = Number(formData.get("quantity") ?? 0) || 0;
  const minQuantity = Number(formData.get("minQuantity") ?? 0) || 0;
  const unitCostRaw = String(formData.get("unitCost") ?? "").trim();

  await prisma.material.create({
    data: {
      name,
      unit,
      quantity,
      minQuantity,
      unitCost: unitCostRaw ? Number(unitCostRaw) : null,
    },
  });

  revalidatePath("/estoque");
}

export async function deleteMaterial(id: string) {
  const movementCount = await prisma.stockMovement.count({
    where: { materialId: id },
  });
  if (movementCount > 0) {
    redirect("/estoque?error=has-movements");
  }

  await prisma.material.delete({ where: { id } });
  revalidatePath("/estoque");
}

export async function createStockMovement(formData: FormData) {
  const materialId = String(formData.get("materialId") ?? "");
  const type = String(formData.get("type") ?? "") as MovementType;
  const quantity = Number(formData.get("quantity") ?? 0);
  const projectId = String(formData.get("projectId") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!materialId || !type || !quantity || quantity <= 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.create({
      data: { materialId, type, quantity, projectId, notes },
    });

    const delta = type === "ENTRADA" ? quantity : -quantity;
    await tx.material.update({
      where: { id: materialId },
      data: { quantity: { increment: delta } },
    });
  });

  revalidatePath("/estoque");
  if (projectId) revalidatePath(`/pedidos/${projectId}`);
}
