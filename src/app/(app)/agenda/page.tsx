import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
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

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function parseMonth(mesParam?: string) {
  if (mesParam) {
    const [year, month] = mesParam.split("-").map(Number);
    if (year && month) return new Date(year, month - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function monthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const currentMonth = parseMonth(mes);
  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);

  const gridStart = startOfWeek(startOfMonth(currentMonth));
  const gridEnd = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const [appointments, clients, projects] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: gridStart, lte: gridEnd } },
      orderBy: { date: "asc" },
      include: { client: true, project: true },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
  ]);

  const allAppointments = await prisma.appointment.findMany({
    orderBy: { date: "asc" },
    include: { client: true, project: true },
  });

  const now = new Date();
  const upcoming = allAppointments.filter((a) => a.date >= now);
  const past = allAppointments.filter((a) => a.date < now);

  const appointmentsByDay = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    const key = format(appt.date, "yyyy-MM-dd");
    const list = appointmentsByDay.get(key) ?? [];
    list.push(appt);
    appointmentsByDay.set(key, list);
  }

  return (
    <div>
      <PageHeader title="Agenda" description="Compromissos e visitas agendadas." />

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link
            href={`/agenda?mes=${monthParam(prevMonth)}`}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange sm:px-3"
          >
            <span aria-hidden>←</span>{" "}
            <span className="hidden sm:inline">Anterior</span>
          </Link>
          <h2 className="text-center text-sm font-semibold text-foreground sm:text-base">
            {(() => {
              const label = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
              return label.charAt(0).toUpperCase() + label.slice(1);
            })()}
          </h2>
          <Link
            href={`/agenda?mes=${monthParam(nextMonth)}`}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange sm:px-3"
          >
            <span className="hidden sm:inline">Próximo</span>{" "}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="bg-surface-muted px-2 py-1.5 text-center font-semibold uppercase text-foreground-muted"
            >
              {label}
            </div>
          ))}

          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayAppointments = appointmentsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={key}
                className={`min-h-[92px] bg-surface p-1.5 ${!inMonth ? "opacity-40" : ""}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                    today ? "bg-brand-orange text-white" : "text-foreground-muted"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayAppointments.slice(0, 3).map((appt) => (
                    <span
                      key={appt.id}
                      title={appt.title}
                      className="truncate rounded bg-brand-orange/10 px-1 py-0.5 text-[11px] font-medium text-brand-orange"
                    >
                      {format(appt.date, "HH:mm")} {appt.title}
                    </span>
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="text-[11px] text-foreground-muted">
                      +{dayAppointments.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

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
