import { prisma } from "@/lib/prisma";
import { createAppointment, deleteAppointment } from "@/lib/actions/appointments";
import { formatDateTime } from "@/lib/format";
import {
  PageHeader,
  Card,
  Input,
  Select,
  Field,
  Button,
  EmptyState,
} from "@/components/ui";

export default async function AgendaPage() {
  const [appointments, clients, projects] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { date: "asc" },
      include: { client: true, project: true },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
  ]);

  const now = new Date();
  const upcoming = appointments.filter((a) => a.date >= now);
  const past = appointments.filter((a) => a.date < now);

  return (
    <div>
      <PageHeader title="Agenda" description="Compromissos e visitas agendadas." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Próximos compromissos</h2>
          {upcoming.length === 0 ? (
            <EmptyState message="Nenhum compromisso futuro agendado." />
          ) : (
            <ul className="mb-6 flex flex-col gap-2">
              {upcoming.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-foreground-muted">
                      {[a.client?.name, a.project?.title].filter(Boolean).join(" · ") || "—"}
                      {a.notes ? ` · ${a.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground-muted">{formatDateTime(a.date)}</span>
                    <form action={deleteAppointment.bind(null, a.id, a.projectId)}>
                      <Button type="submit" variant="danger" className="px-2 py-1 text-xs">
                        Excluir
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mb-3 text-sm font-semibold text-foreground-muted">Anteriores</h2>
              <ul className="flex flex-col gap-2 opacity-70">
                {past.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <p className="text-foreground">{a.title}</p>
                    <span className="text-foreground-muted">{formatDateTime(a.date)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Novo compromisso</h2>
          <form action={createAppointment} className="flex flex-col gap-3">
            <Field label="Título *">
              <Input name="title" required />
            </Field>
            <Field label="Data e hora *">
              <Input name="date" type="datetime-local" required />
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
            <Field label="Observações">
              <Input name="notes" />
            </Field>
            <Button type="submit" className="mt-1">
              Agendar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
