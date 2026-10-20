import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuoteSheet } from "@/components/quote-sheet";
import { PrintButton } from "@/components/print-button";

export default async function OrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: { order: "asc" } },
      contract: { select: { id: true } },
    },
  });

  if (!quote) notFound();

  return (
    <div className="min-h-screen bg-surface-muted print:bg-white">
      <style>{`@page { size: A4; margin: 0; }`}</style>

      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 print:hidden">
        <Link href="/documentos" className="text-sm font-medium text-foreground-muted hover:text-brand-orange">
          ← Voltar para Documentos
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/orcamentos/${quote.id}/editar`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange"
          >
            Editar
          </Link>
          <Link
            href={
              quote.contract
                ? `/contratos/${quote.contract.id}`
                : `/contratos/novo?orcamento=${quote.id}`
            }
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange"
          >
            {quote.contract ? "Ver contrato" : "Gerar contrato"}
          </Link>
          <PrintButton />
        </div>
      </div>

      <QuoteSheet quote={quote} />
    </div>
  );
}
