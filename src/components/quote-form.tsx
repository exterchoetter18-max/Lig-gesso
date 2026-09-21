import { QuoteItemRows } from "@/components/quote-item-rows";
import { Card, Input, Select, Textarea, Field, Button } from "@/components/ui";

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; title: string; client: { name: string } };

export function QuoteForm({
  action,
  clients,
  projects,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  clients: ClientOption[];
  projects: ProjectOption[];
  submitLabel: string;
  defaultValues?: {
    clientId: string;
    projectId: string | null;
    validityDays: number;
    deliveryTerm: string;
    notes: string | null;
    items: { description: string; value: number }[];
  };
}) {
  return (
    <Card className="max-w-2xl">
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cliente *">
            <Select name="clientId" required defaultValue={defaultValues?.clientId ?? ""}>
              <option value="" disabled>
                Selecione um cliente
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Obra vinculada (opcional)">
            <Select name="projectId" defaultValue={defaultValues?.projectId ?? ""}>
              <option value="">Nenhuma</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.client.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Itens do orçamento *">
          <QuoteItemRows initialItems={defaultValues?.items} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Validade (dias)">
            <Input
              name="validityDays"
              type="number"
              min="1"
              defaultValue={defaultValues?.validityDays ?? 30}
            />
          </Field>
          <Field label="Prazo de entrega">
            <Input
              name="deliveryTerm"
              defaultValue={defaultValues?.deliveryTerm ?? "A combinar"}
            />
          </Field>
        </div>

        <Field label="Observações (opcional)">
          <Textarea name="notes" rows={2} defaultValue={defaultValues?.notes ?? ""} />
        </Field>

        <Button type="submit" className="mt-1 self-start">
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
