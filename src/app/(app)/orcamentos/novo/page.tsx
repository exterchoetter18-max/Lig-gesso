import { prisma } from "@/lib/prisma";
import { createQuote } from "@/lib/actions/quotes";
import { QuoteItemRows } from "@/components/quote-item-rows";
import {
  PageHeader,
  Card,
  Input,
  Select,
  Textarea,
  Field,
  Button,
  EmptyState,
} from "@/components/ui";

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
        <Card className="max-w-2xl">
          <form action={createQuote} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente *">
                <Select name="clientId" required defaultValue="">
                  <option value="" disabled>
                    Selecione um cliente
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Obra vinculada (opcional)">
                <Select name="projectId" defaultValue="">
                  <option value="">Nenhuma</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.client.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Itens do orçamento *">
              <QuoteItemRows />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Validade (dias)">
                <Input name="validityDays" type="number" min="1" defaultValue={30} />
              </Field>
              <Field label="Prazo de entrega">
                <Input name="deliveryTerm" defaultValue="A combinar" />
              </Field>
            </div>

            <Field label="Observações (opcional)">
              <Textarea name="notes" rows={2} />
            </Field>

            <Button type="submit" className="mt-1 self-start">
              Gerar orçamento
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
