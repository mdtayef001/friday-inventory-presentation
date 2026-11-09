import { Suspense } from "react"
import type { Metadata } from "next"
import { PageSkeleton } from "@/components/store-gate"
import { getBusinesses } from "@/lib/auth/platform-actions"
import { PlatformOverview } from "./view"

export const metadata: Metadata = { title: "Platform" }

// The data loads behind a placeholder, so moving between platform pages shows something right away.
export default function PlatformPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  )
}

async function Overview() {
  return <PlatformOverview businesses={await getBusinesses()} />
}
