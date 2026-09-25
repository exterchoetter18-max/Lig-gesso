import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { COMPANY } from "@/lib/company";
import { Logo } from "@/components/logo";
import { PrintButton } from "@/components/print-button";

export default async function OrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { order: "asc" } } },
  });

  if (!quote) notFound();

  const total = quote.items.reduce((sum, item) => sum + item.value, 0);

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
          <PrintButton />
        </div>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col overflow-hidden bg-white shadow-lg print:overflow-visible print:shadow-none sm:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col bg-brand-bg px-7 py-10 text-brand-text print:fixed print:inset-y-0 print:left-0 print:h-screen print:w-72 print:text-brand-text sm:w-72">
          <Logo showWordmark={false} size="lg" className="mb-3" />
          <p className="mb-10 text-xs font-semibold uppercase leading-snug tracking-wide text-brand-text-muted">
            {COMPANY.name}
          </p>

          <div className="mb-10 border-t border-brand-border pt-5">
            <p className="mb-2 text-base font-semibold text-brand-text">Proposta</p>
            <p className="text-base">Orçamento válido por {quote.validityDays} dias</p>
            <p className="text-base">Prazo de entrega: {quote.deliveryTerm}</p>
          </div>

          <div className="mb-10 border-t border-brand-border pt-5">
            <p className="mb-2 text-base font-semibold text-brand-text">Forma de pagamento</p>
            <p className="text-base">{COMPANY.payment.responsible}</p>
            <p className="text-base">{COMPANY.payment.methods}</p>
            <p className="text-base">PIX: {COMPANY.payment.pix}</p>
            <p className="mt-2 text-sm text-brand-text-muted">
              Dados da conta jurídica
              <br />
              Banco: {COMPANY.payment.bank}
              <br />
              Agência: {COMPANY.payment.agency}
              <br />
              Conta: {COMPANY.payment.account}
            </p>
          </div>

          <div className="mt-auto border-t border-brand-border pt-5">
            <p className="mb-1 text-base font-semibold text-brand-text">Contato</p>
            <p className="text-base">{COMPANY.contactPhone}</p>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 px-10 py-10 print:ml-72">
          <h1 className="mb-10 text-3xl font-bold text-foreground">
            Orçamento de Prestação de Serviços
          </h1>

          <div className="mb-12 flex flex-wrap gap-x-12 gap-y-6 text-base">
            <div className="min-w-[240px] flex-1">
              <div className="flex items-baseline gap-2 border-b border-foreground pb-2">
                <span className="shrink-0 text-foreground-muted">Nome:</span>
                <span className="truncate text-lg font-semibold text-foreground">
                  {quote.client.name}
                </span>
              </div>
            </div>
            <div className="min-w-[180px]">
              <div className="flex items-baseline gap-2 border-b border-foreground pb-2">
                <span className="shrink-0 text-foreground-muted">Data:</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatDate(quote.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between gap-6 break-after-avoid">
            <span className="text-2xl font-bold text-foreground">Serviço</span>
            <span className="w-40 shrink-0 text-right text-2xl font-bold text-foreground">
              Valor
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex items-end justify-between gap-6 break-inside-avoid text-lg"
              >
                <div className="min-w-0 flex-1 border-b border-foreground pb-2">
                  <span className="text-foreground">{item.description}</span>
                </div>
                <div className="w-40 shrink-0 border-b border-foreground pb-2 text-right">
                  <span className="text-foreground">{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between gap-6 break-inside-avoid border-t-2 border-foreground pt-5">
            <span className="text-2xl font-bold text-foreground">Total</span>
            <span className="w-40 shrink-0 border-b border-foreground pb-2 text-right text-2xl font-bold text-foreground">
              {formatCurrency(total)}
            </span>
          </div>

          {quote.notes && (
            <p className="mt-8 text-base text-foreground-muted">{quote.notes}</p>
          )}

          <div className="mt-20 grid grid-cols-2 gap-10 break-inside-avoid text-center text-base">
            <div>
              <div className="mb-3 border-t border-foreground" />
              <p className="text-foreground-muted">{quote.client.name}</p>
            </div>
            <div>
              <div className="mb-3 border-t border-foreground" />
              <p className="font-medium text-foreground">{COMPANY.name}</p>
              <p className="text-sm text-foreground-muted">{COMPANY.cnpj}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
