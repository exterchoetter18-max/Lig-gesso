import { prisma } from "@/lib/prisma";
import { createQuote } from "@/lib/actions/quotes";
import { QuoteForm } from "@/components/quote-form";
import { PageHeader, Card, EmptyState } from "@/components/ui";

export default async function NovoOrcamentoPage() {
  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { title: "asc" }, include: { client: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Novo orçamento"
        description="Monte os itens do serviço para gerar o orçamento em PDF."
      />

      {clients.length === 0 ? (
        <Card>
          <EmptyState message="Cadastre um cliente antes de criar um orçamento." />
        </Card>
      ) : (
        <QuoteForm
          action={createQuote}
          clients={clients}
          projects={projects}
          submitLabel="Gerar orçamento"
        />
      )}
    </div>
  );
}
