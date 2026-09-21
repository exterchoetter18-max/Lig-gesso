import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createDocument, deleteDocument } from "@/lib/actions/documents";
import { deleteQuote } from "@/lib/actions/quotes";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/format";
import {
  PageHeader,
  Card,
  Table,
  Select,
  Field,
  Button,
  EmptyState,
} from "@/components/ui";

export default async function DocumentosPage() {
  const [documents, quotes, clients, projects] = await Promise.all([
    prisma.document.findMany({
      orderBy: { uploadedAt: "desc" },
      include: { client: true, project: true },
    }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, items: true },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Contratos, orçamentos, fotos e arquivos da empresa."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Orçamentos</h2>
              <Link
                href="/orcamentos/novo"
                className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-orange-hover"
              >
                + Novo orçamento
              </Link>
            </div>
            {quotes.length === 0 ? (
              <EmptyState message="Nenhum orçamento gerado ainda." />
            ) : (
              <ul className="flex flex-col gap-2">
                {quotes.map((quote) => {
                  const total = quote.items.reduce((sum, item) => sum + item.value, 0);
                  return (
                    <li
                      key={quote.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <a
                        href={`/orcamentos/${quote.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <span className="font-medium text-foreground hover:text-brand-orange">
                          {quote.client.name}
                        </span>
                        <span className="ml-2 text-foreground-muted">
                          {formatCurrency(total)} · {formatDate(quote.createdAt)}
                        </span>
                      </a>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/orcamentos/${quote.id}/editar`}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange"
                        >
                          Editar
                        </Link>
                        <form action={deleteQuote.bind(null, quote.id)}>
                          <Button type="submit" variant="danger" className="px-2 py-1 text-xs">
                            Excluir
                          </Button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Arquivos enviados</h2>
          {documents.length === 0 ? (
            <EmptyState message="Nenhum documento enviado ainda." />
          ) : (
            <Table>
              <thead className="bg-surface-muted text-left text-xs font-semibold uppercase text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Arquivo</th>
                  <th className="px-4 py-3">Vínculo</th>
                  <th className="px-4 py-3">Tamanho</th>
                  <th className="px-4 py-3">Enviado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-muted/50">
                    <td className="px-4 py-3">
                      <a
                        href={`/api/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-brand-orange"
                      >
                        {doc.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {[doc.client?.name, doc.project?.title].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form
                        action={deleteDocument.bind(null, doc.id, doc.fileUrl, {
                          clientId: doc.clientId,
                          projectId: doc.projectId,
                        })}
                      >
                        <Button type="submit" variant="danger" className="px-2 py-1 text-xs">
                          Excluir
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Enviar documento</h2>
          <form action={createDocument} className="flex flex-col gap-3">
            <Field label="Arquivo *">
              <input
                name="file"
                type="file"
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-brand-orange file:px-3 file:py-1.5 file:text-white"
              />
            </Field>
            <Field label="Cliente (opcional)">
              <Select name="clientId" defaultValue="">
                <option value="">Nenhum</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Obra (opcional)">
              <Select name="projectId" defaultValue="">
                <option value="">Nenhuma</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" className="mt-1">
              Enviar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
