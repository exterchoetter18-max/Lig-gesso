import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/actions/clients";
import {
  PageHeader,
  Card,
  Table,
  Input,
  Textarea,
  Field,
  Button,
  EmptyState,
} from "@/components/ui";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro e histórico de clientes."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {clients.length === 0 ? (
            <EmptyState message="Nenhum cliente cadastrado ainda." />
          ) : (
            <Table>
              <thead className="bg-surface-muted text-left text-xs font-semibold uppercase text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Obras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-surface-muted/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clientes/${client.id}`}
                        className="font-medium text-foreground hover:text-brand-orange"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {client.phone || client.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {client._count.projects}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Novo cliente
          </h2>
          <form action={createClient} className="flex flex-col gap-3">
            <Field label="Nome *">
              <Input name="name" required />
            </Field>
            <Field label="Telefone / WhatsApp">
              <Input name="phone" />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" />
            </Field>
            <Field label="Endereço">
              <Input name="address" />
            </Field>
            <Field label="Observações">
              <Textarea name="notes" rows={2} />
            </Field>
            <Button type="submit" className="mt-1">
              Cadastrar cliente
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
