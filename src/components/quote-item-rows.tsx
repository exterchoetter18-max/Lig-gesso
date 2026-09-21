"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";

type Row = { key: number; description?: string; value?: number };

export function QuoteItemRows({
  initialItems,
}: {
  initialItems?: { description: string; value: number }[];
}) {
  const [rows, setRows] = useState<Row[]>(
    initialItems && initialItems.length > 0
      ? initialItems.map((item, i) => ({ key: i, ...item }))
      : [{ key: 0 }],
  );
  const [nextKey, setNextKey] = useState(rows.length);

  function addRow() {
    setRows((r) => [...r, { key: nextKey }]);
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="hidden gap-2 text-xs font-medium text-foreground-muted sm:grid sm:grid-cols-[1fr_140px_auto]">
        <span>Serviço / Descrição</span>
        <span>Valor (R$)</span>
        <span />
      </div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:grid sm:grid-cols-[1fr_140px_auto] sm:items-start sm:border-0 sm:p-0"
        >
          <Input
            name="itemDescription"
            placeholder="Ex: Forro em gesso Drywall (com material)"
            defaultValue={row.description}
            required
          />
          <div className="flex items-center gap-2 sm:contents">
            <Input
              name="itemValue"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              defaultValue={row.value}
              required
              className="flex-1 sm:flex-none"
            />
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 px-3"
              onClick={() => removeRow(row.key)}
              disabled={rows.length === 1}
            >
              ✕
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addRow} className="mt-1 self-start">
        + Adicionar item
      </Button>
    </div>
  );
}
