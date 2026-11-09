import "server-only"

export interface DemoAccount {
  role: string
  email: string
  password: string
  note: string
}

const ACCOUNTS: DemoAccount[] = [
  { role: "Super admin", email: "super@friday.app", password: "super123", note: "Runs the platform: all businesses" },
  { role: "Owner", email: "owner@friday.app", password: "owner123", note: "Friday Demo Store: full access" },
  { role: "Manager", email: "manager@friday.app", password: "manager123", note: "Downtown & Uptown outlets" },
  { role: "Staff", email: "staff@friday.app", password: "staff123", note: "Main Warehouse: sells, adds stock, rents out" },
  { role: "Staff (sell only)", email: "seller@friday.app", password: "staff123", note: "Main Warehouse: sells, can't add products" },
  { role: "Staff (products only)", email: "stocker@friday.app", password: "staff123", note: "Main Warehouse: adds products, can't sell" },
  { role: "Owner", email: "cafe@friday.app", password: "cafe1234", note: "Green Leaf Café: rentals switched off" },
  { role: "Owner", email: "urban@friday.app", password: "urban123", note: "Urban Party Rentals" },
]

/**
 * The click-to-fill logins on the login page, for development only.
 *
 * This file is server-only, so the passwords are never part of the JavaScript sent to the
 * browser. In production this returns nothing and the login page renders no demo panel at all.
 */
export function demoAccounts(): DemoAccount[] {
  return process.env.NODE_ENV === "production" ? [] : ACCOUNTS
}
