"use client"

import { useState } from "react"
import { DatabaseBackup, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBusiness } from "@/components/session-provider"

/**
 * Everything the business has, as one ZIP of spreadsheets that open in Excel. For the owner,
 * even while the business is locked; the super admin passes the business's own `href`.
 */
export function DownloadDataButton({
  href = "/api/backend/business/export/",
  label = "Download my data",
  ...props
}: { href?: string; label?: string } & React.ComponentProps<typeof Button>) {
  const [busy, setBusy] = useState(false)
  // Fetched rather than a plain link, so "try again in a few minutes" shows as a message, not a saved file.
  async function download() {
    setBusy(true)
    try {
      const res = await fetch(href)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        return void toast.error(body?.detail ?? "Couldn't prepare the download. Try again.")
      }
      const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? "data.zip"
      const url = URL.createObjectURL(await res.blob())
      const a = Object.assign(document.createElement("a"), { href: url, download: name })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <Button type="button" variant="outline" onClick={download} disabled={busy} {...props}>
      {busy ? <Loader2 className="animate-spin" /> : <Download />}
      {busy ? "Preparing…" : label}
    </Button>
  )
}

/** On Settings: the owner can take their records with them at any time. */
export function YourDataCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseBackup className="size-4 text-primary" />
          Your data
        </CardTitle>
        <CardDescription>
          Everything in {useBusiness().name}: products, stock, sales, purchases, suppliers, clients, rentals, orders, staff and the activity log. One
          ZIP file with a spreadsheet for each, which opens in Excel. It&apos;s yours, so you can download it whenever you like.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DownloadDataButton />
      </CardContent>
    </Card>
  )
}
