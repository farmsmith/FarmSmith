import "server-only";

export interface TaxCalculation {
  taxableAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

type TaxItem = {
  subtotal: number;
  gstRate: number;
};

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Calculates GST from the product-level GST snapshot.
 * FARM_SMITH_STATE defaults to Tamil Nadu and can be overridden in env.
 * Same-state orders are split into CGST + SGST; interstate orders use IGST.
 */
export function calculateTax(
  items: TaxItem[],
  customerState: string
): TaxCalculation {
  const businessState = (process.env.FARM_SMITH_STATE ?? "Tamil Nadu").trim().toLowerCase();
  const normalizedCustomerState = customerState.trim().toLowerCase();

  const taxableAmount = roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
  const taxAmount = roundMoney(
    items.reduce((sum, item) => sum + item.subtotal * (item.gstRate / 100), 0)
  );

  if (normalizedCustomerState === businessState) {
    const cgstAmount = roundMoney(taxAmount / 2);
    const sgstAmount = roundMoney(taxAmount - cgstAmount);
    return {
      taxableAmount,
      taxAmount,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
    };
  }

  return {
    taxableAmount,
    taxAmount,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: taxAmount,
  };
}

export function calculateItemTax(subtotal: number, gstRate: number): number {
  return roundMoney(subtotal * (gstRate / 100));
}
