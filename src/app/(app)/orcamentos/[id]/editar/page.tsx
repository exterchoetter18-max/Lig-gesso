import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateQuote } from "@/lib/actions/quotes";
import { QuoteForm } from "@/components/quote-form";
import { PageHeader } from "@/components/ui";

export default async function EditarOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quote, clients, projects] = await Promise.all([
    prisma.quote.findUnique({
      where: { id },
      include: { items: { orderBy: { order: "asc" } } },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { title: "asc" }, include: { client: true } }),
  ]);

  if (!quote) notFound();

  return (
    <div>
      <PageHeader
        title="Editar orçamento"
        description="Altere os itens, o cliente ou os dados do orçamento."
      />

      <QuoteForm
        action={updateQuote.bind(null, quote.id)}
        clients={clients}
        projects={projects}
        submitLabel="Salvar alterações"
        defaultValues={{
          clientId: quote.clientId,
          projectId: quote.projectId,
          validityDays: quote.validityDays,
          deliveryTerm: quote.deliveryTerm,
          notes: quote.notes,
          items: quote.items.map((i) => ({ description: i.description, value: i.value })),
        }}
      />
    </div>
  );
}
