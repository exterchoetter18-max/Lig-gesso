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

  // Lado a lado (padrão, igual ao modelo da marca) só é seguro quando cabe
  // numa página só — em orçamentos muito longos, a barra lateral vira um
  // bloco quebrado ao imprimir. Nesse caso raro, cai para a barra empilhada
  // em cima do conteúdo, que sempre pagina corretamente.
  const totalDescriptionChars = quote.items.reduce(
    (sum, item) => sum + item.description.length,
    0,
  );
  const isLongQuote =
    quote.items.length > 5 ||
    totalDescriptionChars > 500 ||
    (quote.notes?.length ?? 0) > 200;

  // Preenche com linhas em branco até um mínimo de linhas, para a folha
  // ficar com a cara de um formulário impresso (como o modelo da marca),
  // em vez de um cartão curto com espaço em branco sobrando embaixo.
  const MIN_ROWS = 8;
  const blankRowCount = Math.max(0, MIN_ROWS - quote.items.length);

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

      <div
        className={`mx-auto flex min-h-[297mm] max-w-4xl flex-col overflow-hidden bg-white shadow-lg print:shadow-none sm:flex-row ${
          isLongQuote ? "print:!flex-col" : "print:!flex-row"
        }`}
      >
        {/* Sidebar */}
        <aside
          className={`flex w-full shrink-0 flex-col bg-brand-bg px-7 py-10 text-brand-text sm:w-72 print:break-inside-avoid print:px-6 print:py-3 print:text-brand-text ${
            isLongQuote ? "print:!w-full" : "print:!w-72"
          }`}
        >
          <Logo showWordmark={false} size="lg" className="mb-3 print:mb-1" />
          <p className="mb-10 text-xs font-semibold uppercase leading-snug tracking-wide text-brand-text-muted print:mb-2">
            {COMPANY.name}
          </p>

          <div className="mb-10 border-t border-brand-border pt-5 print:mb-2 print:pt-2 print:text-sm">
            <p className="mb-2 text-base font-semibold text-brand-text print:mb-1 print:text-sm">Proposta</p>
            <p className="text-base print:text-sm">Orçamento válido por {quote.validityDays} dias</p>
            <p className="text-base print:text-sm">Prazo de entrega: {quote.deliveryTerm}</p>
          </div>

          <div className="mb-10 border-t border-brand-border pt-5 print:mb-2 print:pt-2 print:text-sm">
            <p className="mb-2 text-base font-semibold text-brand-text print:mb-1 print:text-sm">Forma de pagamento</p>
            <p className="text-base print:text-sm">{COMPANY.payment.responsible}</p>
            <p className="text-base print:text-sm">{COMPANY.payment.methods}</p>
            <p className="text-base print:text-sm">PIX: {COMPANY.payment.pix}</p>
            <p className="mt-2 text-sm text-brand-text-muted print:mt-1 print:text-xs">
              Dados da conta jurídica
              <br />
              Banco: {COMPANY.payment.bank}
              <br />
              Agência: {COMPANY.payment.agency}
              <br />
              Conta: {COMPANY.payment.account}
            </p>
          </div>

          <div className="mt-auto border-t border-brand-border pt-5 print:pt-2 print:text-sm">
            <p className="mb-1 text-base font-semibold text-brand-text print:text-sm">Contato</p>
            <p className="text-base print:text-sm">{COMPANY.contactPhone}</p>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 px-10 py-10 print:px-8 print:py-3">
          <h1 className="mb-10 text-3xl font-bold text-foreground print:mb-3 print:text-xl">
            Orçamento de Prestação de Serviços
          </h1>

          <div className="mb-12 flex flex-wrap gap-x-12 gap-y-6 text-base print:mb-3 print:gap-y-2">
            <div className="min-w-[240px] flex-1">
              <div className="flex items-baseline gap-2 border-b border-foreground pb-2 print:pb-1">
                <span className="shrink-0 text-foreground-muted">Nome:</span>
                <span className="truncate text-lg font-semibold text-foreground print:text-base">
                  {quote.client.name}
                </span>
              </div>
            </div>
            <div className="min-w-[180px]">
              <div className="flex items-baseline gap-2 border-b border-foreground pb-2 print:pb-1">
                <span className="shrink-0 text-foreground-muted">Data:</span>
                <span className="text-lg font-semibold text-foreground print:text-base">
                  {formatDate(quote.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between gap-6 break-after-avoid print:mb-2">
            <span className="text-2xl font-bold text-foreground print:text-lg">Serviço</span>
            <span className="w-40 shrink-0 text-right text-2xl font-bold text-foreground print:text-lg">
              Valor
            </span>
          </div>

          <div className="flex flex-col gap-6 print:gap-2">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex items-end justify-between gap-6 break-inside-avoid text-lg print:text-sm"
              >
                <div className="min-w-0 flex-1 border-b border-foreground pb-2 print:pb-1">
                  <span className="text-foreground">{item.description}</span>
                </div>
                <div className="w-40 shrink-0 border-b border-foreground pb-2 text-right print:pb-1">
                  <span className="text-foreground">{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))}
            {Array.from({ length: blankRowCount }).map((_, i) => (
              <div
                key={`blank-${i}`}
                aria-hidden
                className="flex items-end justify-between gap-6 break-inside-avoid text-lg print:text-sm"
              >
                <div className="min-w-0 flex-1 border-b border-foreground/40 pb-2 print:pb-1">
                  &nbsp;
                </div>
                <div className="w-40 shrink-0 border-b border-foreground/40 pb-2 text-right print:pb-1">
                  &nbsp;
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between gap-6 break-inside-avoid border-t-2 border-foreground pt-5 print:mt-2 print:pt-2">
            <span className="text-2xl font-bold text-foreground print:text-lg">Total</span>
            <span className="w-40 shrink-0 border-b border-foreground pb-2 text-right text-2xl font-bold text-foreground print:pb-1 print:text-lg">
              {formatCurrency(total)}
            </span>
          </div>

          {quote.notes && (
            <p className="mt-8 text-base text-foreground-muted print:mt-3 print:text-sm">{quote.notes}</p>
          )}

          <div className="mt-20 grid grid-cols-2 gap-10 break-inside-avoid text-center text-base print:mt-6 print:text-sm">
            <div>
              <div className="mb-3 border-t border-foreground print:mb-1" />
              <p className="text-foreground-muted">{quote.client.name}</p>
            </div>
            <div>
              <div className="mb-3 border-t border-foreground print:mb-1" />
              <p className="font-medium text-foreground">{COMPANY.name}</p>
              <p className="text-sm text-foreground-muted">{COMPANY.cnpj}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
