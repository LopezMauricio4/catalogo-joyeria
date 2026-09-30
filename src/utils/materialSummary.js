const cents = amount => Math.round((amount + Number.EPSILON) * 100);

export function summarizeMaterials(components, inventory) {
  const rows = components.map(part => {
    const item = inventory.find(item => item.id === part.itemId);
    const quantity = Number(part.quantity);
    const valid = Boolean(item) && Number.isFinite(quantity) && quantity > 0;
    return { item, quantity, valid,
      costCents: valid ? cents(Number(item.unitCost) * quantity) : 0,
      saleCents: valid ? cents(Number(item.salePrice) * quantity) : 0 };
  });
  return { rows, complete: rows.length > 0 && rows.every(row => row.valid),
    totalCost: rows.reduce((sum, row) => sum + row.costCents, 0) / 100,
    totalSale: rows.reduce((sum, row) => sum + row.saleCents, 0) / 100 };
}
