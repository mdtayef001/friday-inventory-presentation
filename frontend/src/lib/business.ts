import type { BusinessSettings, BusinessStatus, ModuleId, PaymentMethod, PermissionId } from "@/lib/types"

/** Shown as the seller on receipts. Change to your company details. */
export const PLATFORM = {
  name: "Friday Inventory",
  address: "Dhaka, Bangladesh",
}

export function businessStatus(b: { suspended: boolean }): BusinessStatus {
  return b.suspended ? "suspended" : "active"
}

/** "৳1,000" */
export const formatTaka = (amount: number) => `৳${amount.toLocaleString("en-US")}`

export const MODULES: Record<ModuleId, { label: string; description: string }> = {
  rentals: { label: "Rentals", description: "Rent items out by day, week, month or a fixed price." },
  tracking: { label: "Orders & delivery tracking", description: "Track orders from pending to delivered." },
  transfers: { label: "Stock transfers", description: "Move stock between warehouses and shops." },
  trackingLinks: { label: "Client tracking links", description: "Send clients a link to check their order status. No login needed. Needs orders & delivery tracking." },
  purchases: { label: "Buying", description: "Purchases, suppliers and returns to suppliers: what you buy, what you owe and what goes back." },
}

export const PERMISSIONS: Record<PermissionId, { label: string; description: string; role: "manager" | "staff" }> = {
  managerUsers: { label: "Manage staff accounts", description: "Create, disable and reset staff logins at their shops.", role: "manager" },
  managerProducts: { label: "Add, edit and delete products", description: "Otherwise they can view products and change stock only.", role: "manager" },
  managerLocations: { label: "Edit their shop details", description: "Change name, address and phone of shops they run.", role: "manager" },
  managerActivity: { label: "See the activity log", description: "Who did what, and when.", role: "manager" },
  managerProfit: { label: "See cost and profit", description: "On the Sales page and when selling. Otherwise they see prices only.", role: "manager" },
  managerPurchases: { label: "Handle purchases", description: "Record stock bought from suppliers at their shops. They see what you paid.", role: "manager" },
  managerReturns: { label: "Return sales", description: "Take a sale back and refund it at their shops. Otherwise they ask you, and you decide.", role: "manager" },
  staffCreateProducts: { label: "Create new products", description: "When a scanned code is unknown. Otherwise staff only add stock.", role: "staff" },
  staffWalkInSales: {
    label: "Sell to walk-in customers",
    description: "The customer's name is optional when selling. Turn off to make staff pick or add the customer for every sale.",
    role: "staff",
  },
}

/** Currencies a business can choose. One set before this list was narrowed still works. */
export const CURRENCIES = ["BDT", "USD"]
export const CURRENCY_LABEL: Record<string, string> = { BDT: "৳ Bangladeshi taka (BDT)", USD: "$ US dollar (USD)" }

export function defaultSettings(): BusinessSettings {
  return {
    currency: "BDT",
    modules: { rentals: true, tracking: true, transfers: true, trackingLinks: true, purchases: true },
    permissions: {
      managerUsers: true,
      managerActivity: false,
      managerProfit: false,
      managerProducts: true,
      managerLocations: false,
      staffCreateProducts: true,
      managerPurchases: false,
      managerReturns: false,
      staffWalkInSales: true,
    },
    payments: { mobile: false, card: false },
    receiptNote: "",
    lowStockAlert: 5,
  }
}

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; short: string }> = {
  cash: { label: "Cash", short: "Cash" },
  mobile: { label: "Mobile banking (bKash / Nagad)", short: "Mobile" },
  card: { label: "Card machine", short: "Card" },
}

/** The payment methods this business has switched on. Cash always. */
export function enabledMethods(settings: BusinessSettings): PaymentMethod[] {
  const p = settings.payments
  const on: PaymentMethod[] = ["cash"]
  if (p?.mobile) on.push("mobile")
  if (p?.card) on.push("card")
  return on
}
