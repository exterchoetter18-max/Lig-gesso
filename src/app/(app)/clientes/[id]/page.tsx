import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import {
  formatCurrency,
  formatDate,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_TONE,
} from "@/lib/format";
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Field,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

export default async function ClienteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      quotes: { orderBy: { createdAt: "desc" }, include: { items: true } },
    },
  });

  if (!client) notFound();

  const updateClientWithId = updateClient.bind(null, client.id);
  const deleteClientWithId = deleteClient.bind(null, client.id);

  return (
    <div>
      <PageHeader
        title={client.name}
        description="Dados do cliente, obras, orçamentos e documentos vinculados."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Obras / Pedidos
            </h2>
            {client.projects.length === 0 ? (
              <EmptyState message="Nenhuma obra cadastrada para este cliente." />
            ) : (
              <ul className="flex flex-col gap-2">
                {client.projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/pedidos/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-brand-orange"
                    >
                      <span className="font-medium text-foreground">
                        {project.title}
                      </span>
                      <Badge tone={PROJECT_STATUS_TONE[project.status]}>
                        {PROJECT_STATUS_LABEL[project.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Orçamentos
            </h2>
            {client.quotes.length === 0 ? (
              <EmptyState message="Nenhum orçamento gerado para este cliente." />
            ) : (
              <ul className="flex flex-col gap-2">
                {client.quotes.map((quote) => {
                  const total = quote.items.reduce((sum, item) => sum + item.value, 0);
                  return (
                    <li key={quote.id}>
                      <a
                        href={`/orcamentos/${quote.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-brand-orange"
                      >
                        <span className="text-foreground">{formatCurrency(total)}</span>
                        <span className="text-xs text-foreground-muted">
                          {formatDate(quote.createdAt)}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Documentos
            </h2>
            {client.documents.length === 0 ? (
              <EmptyState message="Nenhum documento vinculado a este cliente." />
            ) : (
              <ul className="flex flex-col gap-2">
                {client.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-brand-orange"
                    >
                      <span className="text-foreground">{doc.name}</span>
                      <span className="text-xs text-foreground-muted">
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Editar dados
          </h2>
          <form action={updateClientWithId} className="flex flex-col gap-3">
            <Field label="Nome *">
              <Input name="name" defaultValue={client.name} required />
            </Field>
            <Field label="Telefone / WhatsApp">
              <Input name="phone" defaultValue={client.phone ?? ""} />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" defaultValue={client.email ?? ""} />
            </Field>
            <Field label="Endereço">
              <Input name="address" defaultValue={client.address ?? ""} />
            </Field>
            <Field label="Observações">
              <Textarea name="notes" rows={3} defaultValue={client.notes ?? ""} />
            </Field>
            <Button type="submit" className="mt-1">
              Salvar alterações
            </Button>
          </form>

          <form action={deleteClientWithId} className="mt-3">
            <Button type="submit" variant="danger" className="w-full">
              Excluir cliente
            </Button>
          </form>
          {error === "has-projects" && (
            <p className="mt-2 text-xs text-danger">
              Não é possível excluir: existem obras vinculadas a este cliente.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
