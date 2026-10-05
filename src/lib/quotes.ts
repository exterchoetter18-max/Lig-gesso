import type { DiscountType } from "@prisma/client";

export function quoteTotals(quote: {
  discount: number;
  discountType: DiscountType;
  items: { value: number }[];
}) {
  const subtotal = quote.items.reduce((sum, item) => sum + item.value, 0);
  const rawDiscount =
    quote.discountType === "PERCENTUAL"
      ? (subtotal * quote.discount) / 100
      : quote.discount;
  const discount = Math.min(Math.max(rawDiscount, 0), subtotal);

  return { subtotal, discount, total: subtotal - discount };
}
