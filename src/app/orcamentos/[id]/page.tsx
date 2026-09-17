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

      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 print:hidden">
        <Link href="/documentos" className="text-sm font-medium text-foreground-muted hover:text-brand-orange">
          ← Voltar para Documentos
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col overflow-hidden bg-white shadow-lg print:flex-row print:shadow-none sm:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col bg-brand-bg px-6 py-8 text-brand-text print:w-64 print:text-brand-text sm:w-64">
          <Logo showWordmark={false} className="mb-1" />
          <p className="mb-8 text-[11px] font-semibold uppercase leading-snug tracking-wide text-brand-text-muted">
            {COMPANY.name}
          </p>

          <div className="mb-8 border-t border-brand-border pt-4">
            <p className="mb-2 text-xs font-semibold uppercase text-brand-text-muted">Proposta</p>
            <p className="text-sm">Orçamento válido por {quote.validityDays} dias</p>
            <p className="text-sm">Prazo de entrega: {quote.deliveryTerm}</p>
          </div>

          <div className="mb-8 border-t border-brand-border pt-4">
            <p className="mb-2 text-xs font-semibold uppercase text-brand-text-muted">
              Forma de pagamento
            </p>
            <p className="text-sm">{COMPANY.payment.responsible}</p>
            <p className="text-sm">{COMPANY.payment.methods}</p>
            <p className="text-sm">PIX: {COMPANY.payment.pix}</p>
            <p className="mt-1 text-xs text-brand-text-muted">
              Dados da conta jurídica
              <br />
              Banco: {COMPANY.payment.bank}
              <br />
              Agência: {COMPANY.payment.agency}
              <br />
              Conta: {COMPANY.payment.account}
              <br />
              {COMPANY.cnpj}
            </p>
          </div>

          <div className="mt-auto border-t border-brand-border pt-4">
            <p className="mb-1 text-xs font-semibold uppercase text-brand-text-muted">Contato</p>
            <p className="text-sm">{COMPANY.contactPhone}</p>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 px-8 py-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Orçamento de Prestação de Serviços
          </h1>
          <p className="mb-6 text-sm text-foreground-muted">
            Cliente: <span className="font-medium text-foreground">{quote.client.name}</span>
            {" · "}
            {formatDate(quote.createdAt)}
          </p>

          <table className="mb-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground text-left">
                <th className="pb-2 font-semibold text-foreground">Descrição</th>
                <th className="pb-2 text-right font-semibold text-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-foreground">{item.description}</td>
                  <td className="py-3 text-right text-foreground">
                    {formatCurrency(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground">
                <td className="pt-3 font-bold text-foreground">Total</td>
                <td className="pt-3 text-right font-bold text-foreground">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>

          {quote.notes && (
            <p className="mb-8 text-sm text-foreground-muted">{quote.notes}</p>
          )}

          <div className="mt-16 grid grid-cols-2 gap-8 text-center text-sm">
            <div>
              <div className="mb-2 border-t border-foreground" />
              <p className="text-foreground-muted">{quote.client.name}</p>
            </div>
            <div>
              <div className="mb-2 border-t border-foreground" />
              <p className="font-medium text-foreground">{COMPANY.name}</p>
              <p className="text-xs text-foreground-muted">{COMPANY.cnpj}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
