import { prisma } from "@/lib/prisma";
import { createMaterial, deleteMaterial, createStockMovement } from "@/lib/actions/stock";
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

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [materials, recentMovements] = await Promise.all([
    prisma.material.findMany({ orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      orderBy: { date: "desc" },
      take: 20,
      include: { material: true, project: true },
    }),
  ]);

  const lowStock = materials.filter((m) => m.quantity <= m.minQuantity);

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Materiais disponíveis e movimentações de entrada/saída."
      />

      {error === "has-movements" && (
        <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          Não é possível excluir: existem movimentações registradas para este material.
        </p>
      )}

      {lowStock.length > 0 && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <h2 className="mb-2 text-sm font-semibold text-warning">
            Estoque baixo ({lowStock.length})
          </h2>
          <p className="text-sm text-foreground-muted">
            {lowStock.map((m) => m.name).join(", ")}
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Materiais</h2>
            {materials.length === 0 ? (
              <EmptyState message="Nenhum material cadastrado ainda." />
            ) : (
              <Table>
                <thead className="bg-surface-muted text-left text-xs font-semibold uppercase text-foreground-muted">
                  <tr>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Qtd.</th>
                    <th className="px-4 py-3">Mínimo</th>
                    <th className="px-4 py-3">Custo unit.</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materials.map((m) => {
                    const low = m.quantity <= m.minQuantity;
                    return (
                      <tr key={m.id} className="hover:bg-surface-muted/50">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {m.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className={low ? "font-semibold text-warning" : "text-foreground"}>
                            {m.quantity} {m.unit}
                          </span>
                          {low && (
                            <Badge tone="warning" >
                              baixo
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          {m.minQuantity} {m.unit}
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          {m.unitCost ? formatCurrency(m.unitCost) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form action={deleteMaterial.bind(null, m.id)}>
                            <Button type="submit" variant="danger" className="px-2 py-1 text-xs">
                              Excluir
                            </Button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Registrar movimentação
            </h2>
            {materials.length === 0 ? (
              <EmptyState message="Cadastre um material para registrar movimentações." />
            ) : (
              <form action={createStockMovement} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                <Select name="type" defaultValue="ENTRADA">
                  <option value="ENTRADA">Entrada (compra)</option>
                  <option value="SAIDA">Saída</option>
                </Select>
                <Input name="quantity" type="number" step="0.01" min="0" placeholder="Qtd." required />
                <Input name="notes" placeholder="Observação" />
                <Button type="submit" className="col-span-2 sm:col-span-4">
                  Registrar
                </Button>
              </form>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Movimentações recentes
            </h2>
            {recentMovements.length === 0 ? (
              <EmptyState message="Nenhuma movimentação registrada ainda." />
            ) : (
              <ul className="flex flex-col gap-2">
                {recentMovements.map((mov) => (
                  <li
                    key={mov.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {mov.material.name} — {mov.quantity} {mov.material.unit}
                      {mov.project ? ` (${mov.project.title})` : ""}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge tone={mov.type === "SAIDA" ? "warning" : "success"}>
                        {mov.type === "SAIDA" ? "Saída" : "Entrada"}
                      </Badge>
                      <span className="text-foreground-muted">{formatDate(mov.date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Novo material</h2>
          <form action={createMaterial} className="flex flex-col gap-3">
            <Field label="Nome *">
              <Input name="name" required />
            </Field>
            <Field label="Unidade (un, kg, m², saco...) *">
              <Input name="unit" required />
            </Field>
            <Field label="Quantidade inicial">
              <Input name="quantity" type="number" step="0.01" min="0" defaultValue={0} />
            </Field>
            <Field label="Estoque mínimo (alerta)">
              <Input name="minQuantity" type="number" step="0.01" min="0" defaultValue={0} />
            </Field>
            <Field label="Custo unitário (R$)">
              <Input name="unitCost" type="number" step="0.01" min="0" />
            </Field>
            <Button type="submit" className="mt-1">
              Cadastrar material
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
