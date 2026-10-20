const UNITS = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete",
  "dezoito", "dezenove",
];
const TENS = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta",
  "oitenta", "noventa",
];
const HUNDREDS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function below1000(n: number) {
  if (n === 100) return "cem";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (r) {
    parts.push(
      r < 20
        ? UNITS[r]
        : TENS[Math.floor(r / 10)] + (r % 10 ? ` e ${UNITS[r % 10]}` : ""),
    );
  }
  return parts.join(" e ");
}

function integerWords(n: number) {
  if (n === 0) return "zero";

  const groups = [
    { value: Math.floor(n / 1_000_000), one: "um milhão", many: "milhões" },
    { value: Math.floor(n / 1000) % 1000, one: "mil", many: "mil" },
    { value: n % 1000, one: "um", many: "" },
  ].filter((g) => g.value > 0);

  return groups
    .map((g, i) => {
      const words =
        g.value === 1 ? g.one : `${below1000(g.value)}${g.many ? ` ${g.many}` : ""}`;
      // "mil e trinta", "mil e quinhentos", mas "mil duzentos e trinta"
      if (i === 0) return words;
      const joinWithE = g.value <= 100 || g.value % 100 === 0;
      return `${joinWithE ? " e " : " "}${words}`;
    })
    .join("");
}

/** Valor em reais por extenso. Ex: 9030 → "nove mil e trinta reais". */
export function currencyInWords(value: number) {
  const cents = Math.round(value * 100);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;

  const parts: string[] = [];
  if (reais > 0) {
    const roundMillions = reais >= 1_000_000 && reais % 1_000_000 === 0;
    parts.push(
      `${integerWords(reais)}${roundMillions ? " de" : ""} ${reais === 1 ? "real" : "reais"}`,
    );
  }
  if (centavos > 0) {
    parts.push(`${integerWords(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`);
  }

  return parts.join(" e ") || "zero reais";
}
