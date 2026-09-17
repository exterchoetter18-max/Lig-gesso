import { prisma } from "@/lib/prisma";
import { createTransaction, deleteTransaction } from "@/lib/actions/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  PageHeader,
  Card,
  Table,
  Input,
  Select,
  Field,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

function monthRange(monthParam?: string) {
  const now = new Date();
  const [year, month] = (monthParam ?? "").split("-").map(Number);
  const y = year || now.getFullYear();
  const m = month ? month - 1 : now.getMonth();

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  const value = `${y}-${String(m + 1).padStart(2, "0")}`;
  return { start, end, value };
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const { start, end, value } = monthRange(mes);

  const [transactions, projects] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
      include: { project: true },
    }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
  ]);

  const totalEntradas = transactions
    .filter((t) => t.type === "ENTRADA")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSaidas = transactions
    .filter((t) => t.type === "SAIDA")
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    const sign = t.type === "ENTRADA" ? 1 : -1;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + sign * t.amount);
  }

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Entradas e saídas de caixa da empresa."
      />

      <form className="mb-6 flex items-end gap-3">
        <Field label="Mês">
          <Input name="mes" type="month" defaultValue={value} />
        </Field>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-foreground-muted">Entradas</p>
          <p className="mt-1 text-xl font-bold text-success">{formatCurrency(totalEntradas)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-foreground-muted">Saídas</p>
          <p className="mt-1 text-xl font-bold text-danger">{formatCurrency(totalSaidas)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-foreground-muted">Saldo do mês</p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {formatCurrency(totalEntradas - totalSaidas)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Lançamentos do mês</h2>
          {transactions.length === 0 ? (
            <EmptyState message="Nenhum lançamento neste período." />
          ) : (
            <Table>
              <thead className="bg-surface-muted text-left text-xs font-semibold uppercase text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-muted/50">
                    <td className="px-4 py-3 text-foreground-muted">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {t.category}
                      {t.description && (
                        <span className="block text-xs text-foreground-muted">
                          {t.description}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {t.project?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={t.type === "ENTRADA" ? "success" : "danger"}>
                        {t.type === "ENTRADA" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form
                        action={deleteTransaction.bind(null, t.id, t.projectId)}
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

          {byCategory.size > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Por categoria</h3>
              <ul className="flex flex-col gap-1.5 text-sm">
                {[...byCategory.entries()].map(([category, total]) => (
                  <li key={category} className="flex items-center justify-between">
                    <span className="text-foreground-muted">{category}</span>
                    <span className={total >= 0 ? "text-success" : "text-danger"}>
                      {formatCurrency(total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Novo lançamento</h2>
          <form action={createTransaction} className="flex flex-col gap-3">
            <Field label="Tipo">
              <Select name="type" defaultValue="SAIDA">
                <option value="SAIDA">Saída</option>
                <option value="ENTRADA">Entrada</option>
              </Select>
            </Field>
            <Field label="Categoria *">
              <Input name="category" required list="categorias" />
              <datalist id="categorias">
                <option value="Venda de serviço" />
                <option value="Material" />
                <option value="Mão de obra" />
                <option value="Combustível" />
                <option value="Aluguel" />
                <option value="Ferramentas" />
                <option value="Outros" />
              </datalist>
            </Field>
            <Field label="Valor (R$) *">
              <Input name="amount" type="number" step="0.01" min="0" required />
            </Field>
            <Field label="Data">
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Obra vinculada (opcional)">
              <Select name="projectId" defaultValue="">
                <option value="">Nenhuma</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Descrição">
              <Input name="description" />
            </Field>
            <Button type="submit" className="mt-1">
              Lançar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
