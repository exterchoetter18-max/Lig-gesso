import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const owners = [
    { name: "Suellen", email: "suellen@liggesso.com.br", password: "trocar123" },
    { name: "Alisson", email: "alisson@liggesso.com.br", password: "trocar123" },
  ];

  for (const owner of owners) {
    const passwordHash = await bcrypt.hash(owner.password, 10);
    await prisma.user.upsert({
      where: { email: owner.email },
      update: {},
      create: {
        name: owner.name,
        email: owner.email,
        passwordHash,
      },
    });
  }

  console.log("Usuários criados. Login inicial:");
  owners.forEach((o) => console.log(`  ${o.email} / ${o.password}`));
  console.log("Troque as senhas assim que possível.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
