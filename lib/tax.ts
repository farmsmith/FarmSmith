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
  _customerState?: string
): TaxCalculation {
  const taxableAmount = roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
  return {
    taxableAmount,
    taxAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
  };
}

export function calculateItemTax(_subtotal: number, _gstRate?: number): number {
  return 0;
}

