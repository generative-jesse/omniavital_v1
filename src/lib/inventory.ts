export const SERVINGS_PER_BOTTLE = 30;

export interface InventoryPurchase {
  product_id: string | null;
  quantity: number;
}

export interface InventoryLog {
  product_id: string | null;
  completed: boolean;
}

export interface InventoryItem {
  purchased: number;
  consumed: number;
  remaining: number;
}

export const calculateInventory = (
  purchases: InventoryPurchase[],
  logs: InventoryLog[],
) => {
  const inventory: Record<string, InventoryItem> = {};

  purchases.forEach(({ product_id, quantity }) => {
    if (!product_id) return;
    const current = inventory[product_id] ?? { purchased: 0, consumed: 0, remaining: 0 };
    current.purchased += Math.max(0, quantity) * SERVINGS_PER_BOTTLE;
    current.remaining = Math.max(0, current.purchased - current.consumed);
    inventory[product_id] = current;
  });

  logs.forEach(({ product_id, completed }) => {
    if (!product_id || !completed) return;
    const current = inventory[product_id] ?? { purchased: 0, consumed: 0, remaining: 0 };
    current.consumed += 1;
    current.remaining = Math.max(0, current.purchased - current.consumed);
    inventory[product_id] = current;
  });

  return inventory;
};