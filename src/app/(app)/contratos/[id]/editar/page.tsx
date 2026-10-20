import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateContract } from "@/lib/actions/contracts";
import { quoteTotals } from "@/lib/quotes";
import { ContractForm } from "@/components/contract-form";
import { PageHeader } from "@/components/ui";

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { quote: { include: { client: true, items: true } } },
  });

  if (!contract) notFound();

  const { total } = quoteTotals(contract.quote);

  return (
    <div>
      <PageHeader
        title="Editar contrato"
        description="Para mudar serviços ou valores, edite o orçamento — o contrato acompanha."
      />

      <ContractForm
        action={updateContract.bind(null, contract.id)}
        submitLabel="Salvar alterações"
        client={contract.quote.client}
        total={total}
        defaultValues={{
          workAddress: contract.workAddress,
          deliveryTerm: contract.deliveryTerm,
          downPayment: contract.downPayment,
          paymentMethod: contract.paymentMethod,
          date: contract.date.toLocaleDateString("en-CA", {
            timeZone: "America/Sao_Paulo",
          }),
        }}
      />
    </div>
  );
}
