import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime, PROJECT_STATUS_LABEL, PROJECT_STATUS_TONE } from "@/lib/format";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";

export default async function DashboardPage() {
  const [transactions, materials, upcomingAppointments, activeProjects] =
    await Promise.all([
      prisma.transaction.findMany(),
      prisma.material.findMany(),
      prisma.appointment.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5,
        include: { client: true, project: true },
      }),
      prisma.project.findMany({
        where: { status: "EM_ANDAMENTO" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: true },
      }),
    ]);

  const saldo = transactions.reduce(
    (sum, t) => sum + (t.type === "ENTRADA" ? t.amount : -t.amount),
    0,
  );
  const lowStock = materials.filter((m) => m.quantity <= m.minQuantity);

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do negócio." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-foreground-muted">
            Saldo de caixa
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {formatCurrency(saldo)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-foreground-muted">
            Obras em andamento
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {activeProjects.length}
          </p>
        </Card>
        <Card className={lowStock.length > 0 ? "border-warning/40 bg-warning/5" : ""}>
          <p className="text-xs font-medium uppercase text-foreground-muted">
            Materiais em estoque baixo
          </p>
          <p className="mt-1 text-2xl font-bold text-warning">{lowStock.length}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Obras em andamento</h2>
            <Link href="/pedidos" className="text-xs font-medium text-brand-orange hover:underline">
              Ver todas →
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <EmptyState message="Nenhuma obra em andamento no momento." />
          ) : (
            <ul className="flex flex-col gap-2">
              {activeProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:border-brand-orange"
                  >
                    <span className="text-foreground">
                      {p.title} <span className="text-foreground-muted">· {p.client.name}</span>
                    </span>
                    <Badge tone={PROJECT_STATUS_TONE[p.status]}>
                      {PROJECT_STATUS_LABEL[p.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Próximos compromissos</h2>
            <Link href="/agenda" className="text-xs font-medium text-brand-orange hover:underline">
              Ver agenda →
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <EmptyState message="Nenhum compromisso agendado." />
          ) : (
            <ul className="flex flex-col gap-2">
              {upcomingAppointments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="text-foreground">
                    {a.title}
                    {a.client && (
                      <span className="text-foreground-muted"> · {a.client.name}</span>
                    )}
                  </span>
                  <span className="text-foreground-muted">{formatDateTime(a.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {lowStock.length > 0 && (
          <Card className="lg:col-span-2 border-warning/40 bg-warning/5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-warning">Alerta de estoque baixo</h2>
              <Link href="/estoque" className="text-xs font-medium text-brand-orange hover:underline">
                Ver estoque →
              </Link>
            </div>
            <ul className="flex flex-wrap gap-2">
              {lowStock.map((m) => (
                <li key={m.id}>
                  <Badge tone="warning">
                    {m.name}: {m.quantity} {m.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
