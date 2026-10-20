import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { Card, Input, Field, Button } from "@/components/ui";

export function ContractForm({
  action,
  submitLabel,
  client,
  total,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  client: { id: string; name: string; document: string | null; address: string | null };
  total: number;
  defaultValues: {
    workAddress: string;
    deliveryTerm: string;
    downPayment: number | null;
    paymentMethod: string;
    date: string;
  };
}) {
  const missing = [
    !client.document && "CPF/CNPJ",
    !client.address && "endereço",
  ].filter(Boolean);

  return (
    <Card className="max-w-2xl">
      <div className="mb-4 rounded-lg bg-surface-muted px-4 py-3 text-sm">
        <p className="text-foreground">
          <span className="text-foreground-muted">Contratante:</span>{" "}
          <span className="font-semibold">{client.name}</span>
        </p>
        <p className="text-foreground">
          <span className="text-foreground-muted">Valor total do orçamento:</span>{" "}
          <span className="font-semibold">{formatCurrency(total)}</span>
        </p>
        {missing.length > 0 && (
          <p className="mt-2 text-warning">
            O cadastro do cliente está sem {missing.join(" e ")} — no contrato vai
            aparecer um espaço em branco.{" "}
            <Link href={`/clientes/${client.id}`} className="font-medium underline">
              Completar cadastro
            </Link>
          </p>
        )}
      </div>

      <form action={action} className="flex flex-col gap-4">
        <Field label="Endereço da obra *">
          <Input
            name="workAddress"
            required
            defaultValue={defaultValues.workAddress}
            placeholder="Rua, número, bairro, cidade - UF, CEP"
          />
        </Field>

        <Field label="Prazo de entrega *">
          <Input
            name="deliveryTerm"
            required
            defaultValue={defaultValues.deliveryTerm}
            placeholder="Ex: 10 (dez) dias úteis"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor da entrada (R$, opcional)">
            <Input
              name="downPayment"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              defaultValue={defaultValues.downPayment ?? ""}
            />
          </Field>
          <Field label="Meio de pagamento">
            <Input name="paymentMethod" defaultValue={defaultValues.paymentMethod} />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-foreground-muted">
          Com entrada, o restante fica como pagamento final na entrega da obra. Sem
          entrada, o valor total é pago na entrega.
        </p>

        <Field label="Data do contrato">
          <Input
            name="date"
            type="date"
            defaultValue={defaultValues.date}
            className="sm:max-w-xs"
          />
        </Field>

        <Button type="submit" className="mt-1 self-start">
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
