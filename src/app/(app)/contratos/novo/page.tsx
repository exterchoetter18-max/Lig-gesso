import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createContract } from "@/lib/actions/contracts";
import { quoteTotals } from "@/lib/quotes";
import { ContractForm } from "@/components/contract-form";
import { PageHeader } from "@/components/ui";

export default async function NovoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ orcamento?: string }>;
}) {
  const { orcamento } = await searchParams;
  if (!orcamento) notFound();

  const quote = await prisma.quote.findUnique({
    where: { id: orcamento },
    include: { client: true, items: true, contract: { select: { id: true } } },
  });

  if (!quote) notFound();
  if (quote.contract) redirect(`/contratos/${quote.contract.id}`);

  const { total } = quoteTotals(quote);
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div>
      <PageHeader
        title="Gerar contrato"
        description="Os dados do cliente, serviços e valor vêm do orçamento. Complete o restante."
      />

      <ContractForm
        action={createContract.bind(null, quote.id)}
        submitLabel="Gerar contrato"
        client={quote.client}
        total={total}
        defaultValues={{
          workAddress: quote.client.address ?? "",
          deliveryTerm:
            quote.deliveryTerm === "A combinar" ? "10 (dez) dias úteis" : quote.deliveryTerm,
          downPayment: null,
          paymentMethod: "Pix ou dinheiro",
          date: today,
        }}
      />
    </div>
  );
}
