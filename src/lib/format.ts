export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  ORCAMENTO: "Orçamento",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const PROJECT_STATUS_TONE: Record<
  string,
  "neutral" | "success" | "warning" | "danger" | "brand"
> = {
  ORCAMENTO: "neutral",
  EM_ANDAMENTO: "brand",
  CONCLUIDO: "success",
  CANCELADO: "danger",
};
