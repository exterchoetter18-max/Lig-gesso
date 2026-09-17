import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateProjectStatus,
  updateProject,
  deleteProject,
} from "@/lib/actions/projects";
import { createStockMovement } from "@/lib/actions/stock";
import { createTransaction } from "@/lib/actions/transactions";
import { createAppointment } from "@/lib/actions/appointments";
import { createDocument } from "@/lib/actions/documents";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  PROJECT_STATUS_LABEL,
} from "@/lib/format";
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Select,
  Field,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, materials] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        stockMovements: {
          orderBy: { date: "desc" },
          include: { material: true },
        },
        transactions: { orderBy: { date: "desc" } },
        appointments: { orderBy: { date: "asc" } },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  const updateStatusWithId = updateProjectStatus.bind(null, project.id);
  const updateProjectWithId = updateProject.bind(null, project.id);
  const deleteProjectWithId = deleteProject.bind(null, project.id);

  const totalEntradas = project.transactions
    .filter((t) => t.type === "ENTRADA")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSaidas = project.transactions
    .filter((t) => t.type === "SAIDA")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <PageHeader
        title={project.title}
        description={`Cliente: ${project.client.name}`}
        action={
          <Link
            href={`/clientes/${project.client.id}`}
            className="text-sm font-medium text-brand-orange hover:underline"
          >
            Ver cliente →
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Materiais usados */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Materiais usados nesta obra
            </h2>
            {project.stockMovements.length === 0 ? (
              <EmptyState message="Nenhuma movimentação de estoque registrada." />
            ) : (
              <ul className="mb-4 flex flex-col gap-2">
                {project.stockMovements.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {m.material.name} — {m.quantity} {m.material.unit}
                    </span>
                    <span className="flex items-center gap-2 text-foreground-muted">
                      <Badge tone={m.type === "SAIDA" ? "warning" : "success"}>
                        {m.type === "SAIDA" ? "Saída" : "Entrada"}
                      </Badge>
                      {formatDate(m.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {materials.length === 0 ? (
              <EmptyState message="Cadastre materiais no Estoque para vincular aqui." />
            ) : (
              <form
                action={createStockMovement}
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                <input type="hidden" name="projectId" value={project.id} />
                <Select name="materialId" required defaultValue="" className="col-span-2 sm:col-span-1">
                  <option value="" disabled>
                    Material
                  </option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name}
                    </option>
                  ))}
                </Select>
                <Select name="type" defaultValue="SAIDA">
                  <option value="SAIDA">Saída (uso na obra)</option>
                  <option value="ENTRADA">Entrada (devolução)</option>
                </Select>
                <Input name="quantity" type="number" step="0.01" min="0" placeholder="Qtd." required />
                <Input name="notes" placeholder="Observação" />
                <Button type="submit" className="col-span-2 sm:col-span-4">
                  Registrar movimentação
                </Button>
              </form>
            )}
          </Card>

          {/* Financeiro da obra */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Financeiro da obra
            </h2>
            <div className="mb-3 flex gap-4 text-sm">
              <span className="text-success">Entradas: {formatCurrency(totalEntradas)}</span>
              <span className="text-danger">Saídas: {formatCurrency(totalSaidas)}</span>
              <span className="font-semibold text-foreground">
                Saldo: {formatCurrency(totalEntradas - totalSaidas)}
              </span>
            </div>
            {project.transactions.length === 0 ? (
              <EmptyState message="Nenhum lançamento financeiro vinculado a esta obra." />
            ) : (
              <ul className="mb-4 flex flex-col gap-2">
                {project.transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {t.category}
                      {t.description ? ` — ${t.description}` : ""}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge tone={t.type === "ENTRADA" ? "success" : "danger"}>
                        {formatCurrency(t.amount)}
                      </Badge>
                      <span className="text-foreground-muted">{formatDate(t.date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <form action={createTransaction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Select name="type" defaultValue="SAIDA">
                <option value="SAIDA">Saída (gasto)</option>
                <option value="ENTRADA">Entrada (recebimento)</option>
              </Select>
              <Input name="category" placeholder="Categoria" required />
              <Input name="amount" type="number" step="0.01" min="0" placeholder="Valor (R$)" required />
              <Input name="date" type="date" />
              <Input
                name="description"
                placeholder="Descrição (opcional)"
                className="col-span-2 sm:col-span-3"
              />
              <Button type="submit" className="col-span-2 sm:col-span-1">
                Lançar
              </Button>
            </form>
          </Card>

          {/* Agenda da obra */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Compromissos da obra
            </h2>
            {project.appointments.length === 0 ? (
              <EmptyState message="Nenhum compromisso agendado para esta obra." />
            ) : (
              <ul className="mb-4 flex flex-col gap-2">
                {project.appointments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">{a.title}</span>
                    <span className="text-foreground-muted">{formatDateTime(a.date)}</span>
                  </li>
                ))}
              </ul>
            )}
            <form action={createAppointment} className="grid grid-cols-2 gap-3">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="clientId" value={project.clientId} />
              <Input name="title" placeholder="Título" required className="col-span-2 sm:col-span-1" />
              <Input name="date" type="datetime-local" required />
              <Button type="submit" className="col-span-2">
                Agendar
              </Button>
            </form>
          </Card>

          {/* Documentos da obra */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Documentos da obra
            </h2>
            {project.documents.length === 0 ? (
              <EmptyState message="Nenhum documento vinculado a esta obra." />
            ) : (
              <ul className="mb-4 flex flex-col gap-2">
                {project.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:border-brand-orange"
                    >
                      <span className="text-foreground">{doc.name}</span>
                      <span className="text-foreground-muted">
                        {formatFileSize(doc.size)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <form action={createDocument} className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="clientId" value={project.clientId} />
              <Input name="file" type="file" required className="flex-1" />
              <Button type="submit">Enviar documento</Button>
            </form>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Status</h2>
            <form action={updateStatusWithId} className="flex gap-2">
              <Select name="status" defaultValue={project.status} className="flex-1">
                {Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Button type="submit">Salvar</Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Editar obra
            </h2>
            <form action={updateProjectWithId} className="flex flex-col gap-3">
              <Field label="Título *">
                <Input name="title" defaultValue={project.title} required />
              </Field>
              <Field label="Descrição">
                <Textarea name="description" rows={3} defaultValue={project.description ?? ""} />
              </Field>
              <Field label="Orçamento (R$)">
                <Input
                  name="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={project.budget ?? ""}
                />
              </Field>
              <Field label="Início">
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={project.startDate?.toISOString().slice(0, 10) ?? ""}
                />
              </Field>
              <Field label="Previsão de término">
                <Input
                  name="endDate"
                  type="date"
                  defaultValue={project.endDate?.toISOString().slice(0, 10) ?? ""}
                />
              </Field>
              <Button type="submit" className="mt-1">
                Salvar alterações
              </Button>
            </form>

            <form action={deleteProjectWithId} className="mt-3">
              <Button type="submit" variant="danger" className="w-full">
                Excluir obra
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
