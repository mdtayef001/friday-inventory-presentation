import Link from "next/link"
import type { Metadata } from "next"
import {
  Activity,
  ArrowRight,
  Boxes,
  CalendarClock,
  Database,
  LayoutDashboard,
  LogIn,
  Repeat,
  ScanBarcode,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Friday Inventory",
  description: "A multi-business inventory system: live stock across shops and warehouses, sales, purchases, rentals and delivery tracking.",
}

const FEATURES = [
  {
    icon: Boxes,
    title: "Stock in every location",
    text: "One live quantity per product per warehouse or shop, with low-stock alerts the owner sets. Nothing is counted twice.",
  },
  {
    icon: ScanBarcode,
    title: "Quick Entry by scan",
    text: "Staff scan a QR or barcode to add stock, and create the product on the spot when the code is unknown.",
  },
  {
    icon: ShoppingCart,
    title: "Selling and receipts",
    text: "A cart, cash or mobile or card payment, refunds, and a receipt the customer can open from a link.",
  },
  {
    icon: Truck,
    title: "Orders and delivery",
    text: "Track an order from pending to delivered, and give the client a link to follow it without logging in.",
  },
  {
    icon: CalendarClock,
    title: "Rentals",
    text: "Rent items out by day, week or month, or at a fixed price, with the total worked out from the dates.",
  },
  {
    icon: Repeat,
    title: "Buying and transfers",
    text: "Purchases from suppliers, what you still owe them, returns to suppliers, and stock moved between locations.",
  },
  {
    icon: Users,
    title: "Roles and permissions",
    text: "Owner, manager and staff, each with their own view. The owner decides exactly what managers and staff may do.",
  },
  {
    icon: Activity,
    title: "Activity log",
    text: "Who did what, and when: every stock change, sale, refund and setting, kept for the owner to read.",
  },
]

const STACK = [
  { label: "Frontend", value: "Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui" },
  { label: "Backend", value: "Django 6 · Django REST Framework · JWT" },
  { label: "Database", value: "PostgreSQL (or SQLite for local development)" },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            Friday Inventory
          </span>
          <Button render={<Link href="/login" />} nativeButton={false}>
            <LogIn />
            Log in
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10" />
          <div className="absolute -bottom-40 -left-24 size-80 rounded-full bg-primary/5" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
            <p className="text-sm font-medium text-primary">Final year project</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Everything you stock, in one place.</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Friday Inventory is a multi-business inventory system for shops and warehouses. Each business keeps its own products, stock, staff and
              customers, and its owner decides what the team can see and do. Stock, sales, purchases, rentals and deliveries all stay in step with one
              another.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-11" render={<Link href="/login" />} nativeButton={false}>
                <LogIn />
                Log in to the app
              </Button>
              <Button size="lg" variant="outline" className="h-11" render={<Link href="#features" />} nativeButton={false}>
                See what it does
                <ArrowRight />
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight">What it does</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Each part is a page in the app, and the owner can switch whole features off for their business.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="h-full">
                <CardHeader>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <CardTitle className="mt-3 text-base">{title}</CardTitle>
                  <CardDescription>{text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight">How it&apos;s built</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="size-4 text-primary" />
                    The stack
                  </CardTitle>
                  <CardDescription>A Next.js app in front of a Django REST API, each deployable on its own.</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    {STACK.map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5 border-b pb-3 last:border-0 last:pb-0">
                        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShieldCheck className="size-4 text-primary" />
                      One login, three kinds of access
                    </CardTitle>
                    <CardDescription>
                      Short-lived access tokens are renewed from a refresh token, checked in the Next.js proxy before a page renders, again when the
                      page loads its data, and once more by Django on every API call. A business can never read another business&apos;s rows.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <LayoutDashboard className="size-4 text-primary" />
                      A platform admin above it all
                    </CardTitle>
                    <CardDescription>
                      The super admin creates businesses together with their owner&apos;s login, suspends or restores access, resets an owner&apos;s
                      password, and approves a business that asks to be deleted.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Have a look inside</h2>
              <p className="mt-1 text-muted-foreground">Log in with the account you were given to see the whole app.</p>
            </div>
            <Button size="lg" className="h-11" render={<Link href="/login" />} nativeButton={false}>
              <LogIn />
              Log in
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          <p>Friday Inventory</p>
        </div>
      </footer>
    </div>
  )
}
