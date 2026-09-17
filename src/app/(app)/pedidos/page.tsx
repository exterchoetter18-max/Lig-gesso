import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/lib/actions/projects";
import { formatDate, PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from "@/lib/format";
import {
  PageHeader,
  Card,
  Table,
  Input,
  Textarea,
  Select,
  Field,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

export default async function PedidosPage() {
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Pedidos / Obras"
        description="Controle das obras em andamento, orçamentos e histórico."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {projects.length === 0 ? (
            <EmptyState message="Nenhuma obra cadastrada ainda." />
          ) : (
            <Table>
              <thead className="bg-surface-muted text-left text-xs font-semibold uppercase text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Início</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-muted/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/pedidos/${project.id}`}
                        className="font-medium text-foreground hover:text-brand-orange"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {project.client.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PROJECT_STATUS_TONE[project.status]}>
                        {PROJECT_STATUS_LABEL[project.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {project.startDate ? formatDate(project.startDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Nova obra / pedido
          </h2>
          {clients.length === 0 ? (
            <EmptyState message="Cadastre um cliente antes de criar uma obra." />
          ) : (
            <form action={createProject} className="flex flex-col gap-3">
              <Field label="Título *">
                <Input name="title" required />
              </Field>
              <Field label="Cliente *">
                <Select name="clientId" required defaultValue="">
                  <option value="" disabled>
                    Selecione um cliente
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Descrição">
                <Textarea name="description" rows={2} />
              </Field>
              <Field label="Orçamento (R$)">
                <Input name="budget" type="number" step="0.01" min="0" />
              </Field>
              <Field label="Início">
                <Input name="startDate" type="date" />
              </Field>
              <Field label="Previsão de término">
                <Input name="endDate" type="date" />
              </Field>
              <Button type="submit" className="mt-1">
                Cadastrar obra
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
