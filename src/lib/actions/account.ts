"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function changePassword(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/conta?error=campos");
  }

  if (newPassword.length < 6) {
    redirect("/conta?error=curta");
  }

  if (newPassword !== confirmPassword) {
    redirect("/conta?error=confirmacao");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    redirect("/conta?error=atual");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  redirect("/conta?success=1");
}
