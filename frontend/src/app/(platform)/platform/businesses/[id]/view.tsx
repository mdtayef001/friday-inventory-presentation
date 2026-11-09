"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ban, CheckCircle2, KeyRound, Trash2, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadDataButton } from "@/components/your-data"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmAction, Field, PageBody, PageHeader, Pill, useRequired, TimeAgo } from "@/components/common"
import { BusinessStatusPill } from "@/components/platform"
import { initials } from "@/components/user-menu"
import { decideDeletion, deleteBusiness, resetOwnerPassword, setBusinessSuspended } from "@/lib/auth/platform-actions"
import type { ActionResult } from "@/lib/auth/user-actions"
import { roleLabel } from "@/lib/auth/roles"
import { formatDate } from "@/lib/format"
import { MODULES, PERMISSIONS } from "@/lib/business"
import type { BusinessSummary, ManagedUser, ModuleId, PermissionId } from "@/lib/types"

function showResult(result: ActionResult, success: string) {
  if (result.ok) toast.success(success)
  else toast.error(result.error)
  return result.ok
}

export function BusinessDetailView({ business, users }: { business: BusinessSummary; users: ManagedUser[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [resetting, setResetting] = useState<ManagedUser | null>(null)
  const run = (fn: () => Promise<ActionResult>, success: string) => startTransition(async () => void showResult(await fn(), success))

  return (
    <PageBody>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/platform/businesses" />} nativeButton={false}>
        <ArrowLeft />
        Businesses
      </Button>
      <PageHeader
        title={business.name}
        description={`${business.industry || "No industry set"} · joined ${formatDate(business.createdAt)}`}
        actions={
          <>
            <DownloadDataButton href={`/api/backend/platform/businesses/${business.id}/export/`} label="Download data" />
            {business.suspended ? (
              <Button disabled={pending} onClick={() => run(() => setBusinessSuspended(business.id, false), "Access restored")}>
                <CheckCircle2 />
                Restore access
              </Button>
            ) : (
              <ConfirmAction
                trigger={
                  <Button variant="outline" disabled={pending}>
                    <Ban />
                    Suspend
                  </Button>
                }
                title={`Suspend ${business.name}?`}
                description="Everyone in this business is logged out and can't log in, even if they pay, until you restore access. Nothing is deleted."
                confirmLabel="Suspend"
                destructive
                onConfirm={async () => showResult(await setBusinessSuspended(business.id, true), "Business suspended")}
              />
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <BusinessStatusPill status={business.status} />
        <Pill tone="gray">{business.settings.currency}</Pill>
      </div>

      {business.deletionRequestedAt && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-4" />
              {business.deleteOn ? `Will be deleted on ${formatDate(business.deleteOn)}` : "The owner wants this business deleted"}
            </CardTitle>
            <CardDescription>
              {business.deletionRequestedBy ?? "The Owner"} asked on {formatDate(business.deletionRequestedAt)}.{" "}
              {business.deleteOn
                ? "It's locked. The owner can still download their data, and either of you can stop it until that day."
                : "Approving locks it now and deletes everything 30 days later. The owner can download their data and change their mind until then."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!business.deleteOn && (
              <ConfirmAction
                trigger={
                  <Button variant="destructive" disabled={pending}>
                    <Trash2 />
                    Approve deletion
                  </Button>
                }
                title={`Approve deleting ${business.name}?`}
                description="It locks for everyone now and is deleted for good in 30 days, unless the owner or you stop it first."
                confirmLabel="Approve"
                destructive
                onConfirm={async () => showResult(await decideDeletion(business.id, "approve"), "Approved. It will be deleted in 30 days.")}
              />
            )}
            <Button variant="outline" disabled={pending} onClick={() => run(() => decideDeletion(business.id, "stop"), business.deleteOn ? "Deletion stopped" : "Request turned down")}>
              <Undo2 />
              {business.deleteOn ? "Stop the deletion" : "Turn down"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Set up by the owner</CardTitle>
            <CardDescription>Only {business.owner?.name ?? "the owner"} can change these, from their Business Settings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Features</p>
              <ul className="space-y-1.5 text-sm">
                {(Object.keys(MODULES) as ModuleId[]).map((id) => (
                  <OnOff key={id} on={business.settings.modules[id]} label={MODULES[id].label} />
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Team permissions</p>
              <ul className="space-y-1.5 text-sm">
                {(Object.keys(PERMISSIONS) as PermissionId[]).map((id) => (
                  <OnOff
                    key={id}
                    on={business.settings.permissions[id]}
                    label={`${PERMISSIONS[id].role === "manager" ? "Managers" : "Staff"}: ${PERMISSIONS[id].label.toLowerCase()}`}
                  />
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="py-0">
        <CardHeader className="pt-6">
          <CardTitle>People</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "account" : "accounts"}. The owner creates and manages everyone else.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="w-10 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Pill tone={u.role === "owner" ? "violet" : u.role === "manager" ? "blue" : "gray"}>{roleLabel(u)}</Pill>
                  </TableCell>
                  <TableCell>{u.active ? <Pill tone="green">Active</Pill> : <Pill tone="red">Disabled</Pill>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.lastLoginAt ? <TimeAgo at={u.lastLoginAt} /> : "Never"}</TableCell>
                  <TableCell className="pr-4">
                    {u.role === "owner" && (
                      <Button variant="ghost" size="sm" onClick={() => setResetting(u)}>
                        <KeyRound />
                        Reset password
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Delete this business</p>
            <p className="text-sm text-muted-foreground">Removes the business and every account in it. This can&apos;t be undone.</p>
          </div>
          <ConfirmAction
            trigger={
              <Button variant="destructive">
                <Trash2 />
                Delete business
              </Button>
            }
            title={`Delete ${business.name}?`}
            description={`This removes the business and all ${users.length} of its accounts permanently.`}
            confirmLabel="Delete forever"
            destructive
            onConfirm={async () => {
              const ok = showResult(await deleteBusiness(business.id), "Business deleted")
              if (ok) router.push("/platform/businesses")
              return ok
            }}
          />
        </CardContent>
      </Card>

      {resetting && <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />}
    </PageBody>
  )
}

function OnOff({ on, label }: { on: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={on ? undefined : "text-muted-foreground"}>{label}</span>
      {on ? <Pill tone="green">On</Pill> : <Pill tone="gray">Off</Pill>}
    </li>
  )
}

function ResetPasswordDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const [password, setPassword] = useState("")
  const [pending, startTransition] = useTransition()
  const required = useRequired()
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!required.check(password.length >= 8, e)) return
            startTransition(async () => {
              if (showResult(await resetOwnerPassword(user.id, password), "Password changed")) onClose()
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>Reset owner password</DialogTitle>
            <DialogDescription>Set a new password for {user.name}, then share it with them directly.</DialogDescription>
          </DialogHeader>
          <Field label="New password" htmlFor="op" required missing={required.shown && password.length < 8} hint="At least 8 characters.">
            <Input id="op" type="text" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" autoFocus />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Save password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
