import { prisma } from "@/lib/prisma";
import { createDocument, deleteDocument } from "@/lib/actions/documents";
import { formatDate, formatFileSize } from "@/lib/format";
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
  const [documents, clients, projects] = await Promise.all([
    prisma.document.findMany({
      orderBy: { uploadedAt: "desc" },
      include: { client: true, project: true },
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
        <Card className="lg:col-span-2">
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
