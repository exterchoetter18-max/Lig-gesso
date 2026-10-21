import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { currencyInWords } from "@/lib/extenso";
import { quoteTotals } from "@/lib/quotes";
import { COMPANY } from "@/lib/company";
import { QuoteSheet } from "@/components/quote-sheet";
import { PrintButton } from "@/components/print-button";

const BLANK = "______________________________";

function money(value: number) {
  return `${formatCurrency(value)} (${currencyInWords(value)})`;
}

function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 print:mt-5">
      <h2 className="mb-2 break-after-avoid font-bold uppercase">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Item({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 break-inside-avoid">
      <span className="w-10 shrink-0">{n}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default async function ContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      quote: { include: { client: true, items: { orderBy: { order: "asc" } } } },
    },
  });

  if (!contract) notFound();

  const { quote } = contract;
  const { client } = quote;
  const { total } = quoteTotals(quote);

  const digits = (client.document ?? "").replace(/\D/g, "");
  const isCompany = digits.length === 14;
  const isPerson = digits.length === 11;
  const documentLabel = isCompany ? "CNPJ" : isPerson ? "CPF" : "CPF/CNPJ";
  const qualification = isCompany
    ? "pessoa jurídica, com sede na"
    : isPerson
      ? "pessoa física, residente e domiciliada na"
      : "com endereço na";

  const downPayment =
    contract.downPayment && contract.downPayment < total ? contract.downPayment : null;
  const finalPayment = total - (downPayment ?? 0);

  const contractDate = contract.date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const C = <strong>CONTRATANTE</strong>;
  const D = <strong>CONTRATADO</strong>;

  return (
    <div className="min-h-screen bg-surface-muted print:bg-white">
      {/* O anexo usa uma página sem margem, igual ao orçamento impresso sozinho;
          com as margens do contrato a folha ficava estreita demais. */}
      <style>{`
        @page { size: A4; margin: 18mm 16mm; }
        @page anexo { size: A4; margin: 0; }
        .quote-annex { page: anexo; }
      `}</style>

      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 print:hidden">
        <Link href="/documentos" className="text-sm font-medium text-foreground-muted hover:text-brand-orange">
          ← Voltar para Documentos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/contratos/${contract.id}/editar`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange"
          >
            Editar contrato
          </Link>
          <Link
            href={`/orcamentos/${quote.id}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:border-brand-orange hover:text-brand-orange"
          >
            Só o orçamento
          </Link>
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-4xl bg-white px-6 py-10 text-justify text-[15px] leading-relaxed text-foreground shadow-lg sm:px-16 print:max-w-none print:p-0 print:text-[13px] print:shadow-none">
        <h1 className="mb-6 text-center text-lg font-bold underline">
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS
        </h1>

        <p className="font-bold">
          Pelo presente instrumento de contrato de prestação de serviços,{" "}
          <u>as partes abaixo qualificadas</u>, resolvem ajustar as cláusulas seguintes:
        </p>

        <p className="mt-5">
          <strong>
            <u>CONTRATANTE: {client.name}</u>,
          </strong>{" "}
          {qualification} {client.address || BLANK}, inscrita no{" "}
          <strong>
            {documentLabel} sob o n.º {client.document || BLANK}.
          </strong>
        </p>

        <p className="mt-5">
          <strong>
            <u>CONTRATADO: {COMPANY.contract.name}</u>
          </strong>
          , {COMPANY.contract.legalType}, com sede na {COMPANY.contract.address},{" "}
          <strong>representada por {COMPANY.contract.representative}</strong>, inscrita no{" "}
          <strong>CNPJ sob o n.º {COMPANY.cnpj}.</strong>
        </p>

        <p className="mt-5 font-bold underline">
          Assumem por meio do presente termo a responsabilidade pelas cláusulas deste
          contrato de prestação de serviços, ambas representadas por seus titulares legais
          abaixo assinados, com os objetivos e condições adiante descritas:
        </p>

        <Clause title="Cláusula primeira - Do objeto do contrato">
          <Item n="1.">
            O presente contrato de prestação de serviços tem por objetivo{" "}
            <strong>
              executar de acordo com as especificações, quantitativos, os valores e as
              demais condições constantes do orçamento anexo, o qual passa a integrar o
              presente instrumento para todos os fins, juntamente com as disposições
              estabelecidas neste contrato.
            </strong>
          </Item>
          <Item n="2.">
            O Endereço da execução da respectiva obra se encontra na {contract.workAddress}
          </Item>
        </Clause>

        <Clause title="Cláusula segunda – Obrigações das partes">
          <Item n="2.1.">
            O presente contrato configura trabalho autônomo de prestação de serviços, não
            havendo qualquer vínculo empregatício com o {C}
          </Item>
        </Clause>

        <Clause title="Cláusula terceira – Do prazo de entrega">
          <Item n="3.1.">
            As atividades terão o prazo de entrega a ser cumprido pelo CONTRATADO da
            seguinte forma:
            <p className="mt-2 pl-4">
              a) {contract.deliveryTerm} a partir do início da obra para todos os serviços
              descritos conforme cláusula 1.
            </p>
          </Item>
        </Clause>

        <Clause title="Cláusula quarta – Da precificação e do pagamento">
          <Item n="4.1.">
            <strong>
              <u>PRECIFICAÇÃO TOTAL DO SERVIÇO PRESTADO:</u>
            </strong>{" "}
            pela prestação dos serviços elencados neste contrato, na sua cláusula primeira,
            será pago o valor total de{" "}
            <strong>
              <u>{money(total)}</u>{" "}
              {downPayment ? "parcelados na seguinte forma:" : "da seguinte forma:"}
            </strong>
            <div className="mt-2 flex flex-col gap-1 pl-4 font-bold">
              {downPayment ? (
                <>
                  <p>
                    a) Entrada de {money(downPayment)} {contract.paymentMethod} a ser
                    informado pelo contratado;
                  </p>
                  <p>
                    b) Pagamento final de {money(finalPayment)} {contract.paymentMethod} a
                    ser informado pelo contratado, na finalização da respectiva obra.
                  </p>
                </>
              ) : (
                <p>
                  a) Pagamento integral de {money(total)} {contract.paymentMethod} a ser
                  informado pelo contratado, na finalização da respectiva obra.
                </p>
              )}
            </div>
          </Item>
          <Item n="4.2.">
            <strong>
              <u>ATRASO NO PAGAMENTO:</u>
            </strong>{" "}
            havendo atraso no pagamento de qualquer importância devida ao {D} por força
            deste contrato, sobre as parcelas vencidas incidirão juros legais de 1% ao mês
            sobre o débito vencido e correção monetária calculada pelo IPCA.
          </Item>
          <Item n="4.3.">
            <strong>
              <u>ATRASO NA OBRA:</u>
            </strong>{" "}
            havendo atraso no prosseguimento da execução da obra por motivos de força maior,
            conforme cronograma pré-estabelecido em cláusula 4.1, o pagamento será
            prorrogado para a sexta-feira subsequente, se previamente acordado entre o {C} e
            a <strong>CONTRATADA,</strong> limitando-se ao prazo de máximo de entrega.
          </Item>
          <Item n="4.4.">
            <strong>
              <u>REAJUSTE:</u>
            </strong>{" "}
            todos os valores mencionados neste contrato serão reajustados anualmente
            conforme variação do IGPM, no mês de janeiro de cada ano. Ocorrendo a
            descaracterização deste índice ou sua extinção, outro índice será sugerido via
            aditivo contratual.
          </Item>
        </Clause>

        <Clause title="Cláusula quinta – Do prazo de vigência">
          <Item n="5.1.">
            O prazo de vigência do presente contrato é de até 1 (um) mês, vigorando a partir
            da sua assinatura e finalizando com a entrega do respectivo serviço.
          </Item>
        </Clause>

        <Clause title="Cláusula sexta – Da propriedade">
          <Item n="6.1.">
            As alterações solicitadas são de propriedade da <strong>CONTRATANTE.</strong> Na
            eventual rescisão contratual, o {D} manterá à {C} os serviços executados até a
            data limite da solicitação de rescisão contratual.
          </Item>
        </Clause>

        <Clause title="Cláusula sétima – Da responsabilidade da contratante">
          <Item n="7.1.">
            A {C} compromete-se a disponibilizar para o {D} todas as informações,
            documentos e procedimentos necessários ao desenvolvimento das atividades objeto
            deste contrato.
          </Item>
          <Item n="7.2.">
            Na eventualmente de postergação da implementação do objeto por iniciativa da{" "}
            <strong>CONTRATANTE,</strong> esta deverá ser formalizada e justificada para que
            seja estipulado um novo cronograma, conforme disponibilidade do{" "}
            <strong>CONTRATADO,</strong>{" "}
            <u>
              sem prejuízo da validade deste contrato e dos respectivos compromissos
              financeiros/valores/prazos de pagamento assumidos pela {C} na cláusula quinta.
            </u>
          </Item>
        </Clause>

        <Clause title="Cláusula oitava – Da responsabilidade do contratado">
          <Item n="8.1.">
            Após o recebimento das informações necessárias para o início do objetivo deste
            contrato, o {D} dará início à prestação de serviços.
          </Item>
          <Item n="8.2.">
            Atrasos ocorridos em decorrência da falta de informações, documentos ou serviços
            pela {C} implicará prorrogação do prazo para encerramento do projeto,{" "}
            <strong>
              <u>sem ônus</u>
            </strong>{" "}
            para o {D} e <u>sem prejuízo dos pagamentos devidos pela vigência iniciada</u>.
          </Item>
          <Item n="8.3.">
            O {D} não se responsabiliza por ações movidas pela não observância da cláusula
            oitava.
          </Item>
          <Item n="8.4.">
            O {D} não garante o suporte necessário por alterações como clima e demais
            impossibilidades de acesso que sejam de responsabilidade do CONTRATANTE ou de
            condomínios se este for o caso ou serviços de terceiros por ele contratados.
          </Item>
          <Item n="8.5.">
            Serão de responsabilidade do {D} os meios necessários para a viabilização da
            prestação de serviço objeto deste contrato, incluindo equipamentos, local de
            trabalho, salvo obrigações da {C} previstas neste contrato.
          </Item>
        </Clause>

        <Clause title="Cláusula nona – Da confidencialidade e observância à LGPD (Lei de Proteção de Dados)">
          <Item n="9.1.">
            O {D} compromete-se a tomar todas as medidas necessárias à proteção das
            informações e dados da {C} para evitar revelação a terceiros, exceto se
            devidamente autorizado pela <strong>CONTRATANTE.</strong>
          </Item>
          <Item n="9.2.">
            A {C} declara expresso <strong>CONSENTIMENTO</strong> que o {D} irá coletar,
            tratar e compartilhar os dados necessários ao cumprimento do contrato, nos
            termos do Art. 7o, inc. V da LGPD, os dados necessários para cumprimento de
            obrigações legais, nos termos do Art. 7° inc. II da LGPD, bem como os dados, se
            necessários para proteção ao crédito conforme autorizado pelo Art. 7°, inc. V da
            LGPD.
          </Item>
          <Item n="9.3.">
            O {D} compromete-se a não revelar, reproduzir, vender, trocar ou utilizar para
            proveito comercial de terceiros qualquer dado ou informações pertencentes à {C}{" "}
            ou de seus clientes, nos termos da lei n.º 13.709/2018.
          </Item>
          <Item n="9.4.">
            O {C} declara <u>expresso consentimento</u> de que o {D} irá frequentar o imóvel
            a fim de ser executado o respectivo trabalho, sendo estritamente necessário ao
            cumprimento deste contrato.
          </Item>
        </Clause>

        <Clause title="Cláusula décima - Da rescisão contratual">
          <Item n="10.1">
            O descumprimento de qualquer uma das cláusulas por qualquer parte implicará na
            rescisão imediata deste contrato,{" "}
            <strong>
              <u>não isentando</u>
            </strong>{" "}
            o {D} de suas responsabilidades referentes ao zelo com as informações da{" "}
            <strong>CONTRATANTE.</strong>
          </Item>
          <Item n="10.2.">
            Havendo descumprimento deste contrato, será devida multa de 10% sobre o valor do
            contrato.
          </Item>
          <Item n="10.3.">
            As partes poderão rescindir o contrato a qualquer momento, sob aviso prévio de
            15 dias, desde que as parcelas devidas ao {D} conforme itens da cláusula 4.1,
            tenham sido quitadas<strong>.</strong>
          </Item>
        </Clause>

        <Clause title="Cláusula décima primeira – Das disposições gerais">
          <Item n="11.1.">
            O {D} não será em hipótese alguma responsável por perdas de lucros, clientela ou
            funções que decorreram do objeto deste contrato pela {C} ou seus colaboradores.
          </Item>
          <Item n="11.2.">
            O {D} não será responsabilizado sob este contrato por receita perdida ou danos
            indiretos, especiais, incidentes ou punitivos.
          </Item>
        </Clause>

        <Clause title="Cláusula décima segunda – Do foro">
          <Item n="12.1.">
            As partes elegem o foro de {COMPANY.contract.city} para dirimir quaisquer
            dúvidas oriundas do presente instrumento.
          </Item>
        </Clause>

        <div className="break-inside-avoid">
          <p className="mt-6 font-bold">
            E por estarem justas e CONTRATADAS as partes,{" "}
            <u>assinam o presente em duas vias de igual teor e forma</u>.
          </p>

          <p className="mt-6 text-right">
            {COMPANY.contract.city}, {contractDate}.
          </p>

          <div className="mx-auto mt-16 max-w-md text-center print:mt-12">
            <div className="border-t border-foreground" />
            <p className="mt-2 font-bold underline">{COMPANY.contract.name}</p>
            <p className="font-bold">CONTRATADO</p>
          </div>

          <div className="mx-auto mt-16 max-w-md text-center print:mt-12">
            <div className="border-t border-foreground" />
            <p className="mt-2 font-bold underline">{client.name}</p>
            <p className="font-bold">CONTRATANTE</p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-10 text-left print:mt-12">
            {[1, 2].map((n) => (
              <div key={n}>
                <div className="border-t border-foreground" />
                <p className="mt-2 font-bold underline">Testemunha:</p>
                <p className="mt-2 font-bold underline">CPF:</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="quote-annex mx-auto mt-8 max-w-4xl pb-10 break-before-page print:mt-0 print:pb-0">
        <QuoteSheet quote={quote} />
        <p className="mt-2 px-4 text-sm underline print:px-8">Anexo 1</p>
      </div>
    </div>
  );
}
