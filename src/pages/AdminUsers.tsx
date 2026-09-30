import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Check, RefreshCw, Search, Shield, UserRound, X } from "lucide-react"
import { supabase, Profile } from "../lib/supabase"
import { useAuth } from "../store/auth"

type StatusFilter = "all" | Profile["status"]
type RoleFilter = "all" | Profile["role"]
type ProfileChanges = Partial<Pick<Profile, "role" | "status" | "approved_at">>

const statusFilters: StatusFilter[] = ["all", "pending", "approved", "rejected"]

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object" && "message" in error) return String(error.message)
  return String(error)
}

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const { user: currentUser, isAdmin } = useAuth()

  useEffect(() => {
    if (isAdmin) void loadUsers()
  }, [isAdmin])

  const loadUsers = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (profile: Profile, changes: ProfileChanges, successMessage: string) => {
    setUpdatingUserId(profile.id)
    setActionError("")
    setNotice("")
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(changes)
        .eq("id", profile.id)
        .select("*")
        .single()
      if (error) throw error
      setUsers(current => current.map(user => user.id === profile.id ? data as Profile : user))
      setNotice(successMessage)
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setUpdatingUserId(null)
    }
  }

  const activeAdminCount = users.filter(user => user.role === "admin" && user.status === "approved").length

  const handleStatusChange = (profile: Profile, status: Profile["status"]) => {
    if (profile.id === currentUser?.id) {
      setActionError("You cannot change your own access from this screen.")
      return
    }
    if (profile.role === "admin" && profile.status === "approved" && status !== "approved" && activeAdminCount <= 1) {
      setActionError("At least one approved administrator must remain.")
      return
    }
    const changes: ProfileChanges = { status }
    if (status === "approved") changes.approved_at = new Date().toISOString()
    void updateUser(profile, changes, status === "approved" ? "User approved." : "User access rejected.")
  }

  const handleRoleChange = (profile: Profile, role: Profile["role"]) => {
    if (profile.id === currentUser?.id) {
      setActionError("You cannot change your own role from this screen.")
      return
    }
    if (profile.role === "admin" && profile.status === "approved" && role !== "admin" && activeAdminCount <= 1) {
      setActionError("At least one approved administrator must remain.")
      return
    }
    void updateUser(profile, { role }, `Role updated to ${role}.`)
  }

  const filteredUsers = users.filter(profile => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery = !normalizedQuery ||
      profile.full_name?.toLowerCase().includes(normalizedQuery) ||
      profile.email?.toLowerCase().includes(normalizedQuery)
    return matchesQuery &&
      (statusFilter === "all" || profile.status === statusFilter) &&
      (roleFilter === "all" || profile.role === roleFilter)
  })

  if (!isAdmin) {
    return (
      <div className="p-4">
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Review access requests and manage account roles.</p>
        </div>
        <Button variant="outline" onClick={() => void loadUsers()} disabled={loading} title="Refresh users">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>{users.length} total users, {activeAdminCount} approved administrators.</CardDescription>
          <div className="flex flex-col gap-3 pt-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search users"
                placeholder="Search name or email"
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by account status">
              {statusFilters.map(status => {
                const count = status === "all" ? users.length : users.filter(user => user.status === status).length
                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={statusFilter === status ? "secondary" : "ghost"}
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All" : status[0].toUpperCase() + status.slice(1)} <span className="ml-1 text-muted-foreground">{count}</span>
                  </Button>
                )
              })}
            </div>
            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={event => setRoleFilter(event.target.value as RoleFilter)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Users</option>
            </select>
          </div>
          {loadError && <p role="alert" className="text-sm text-red-500">Could not load users: {loadError}</p>}
          {actionError && <p role="alert" className="text-sm text-red-500">{actionError}</p>}
          {notice && <p role="status" className="text-sm text-emerald-600">{notice}</p>}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((profile) => {
                  const isSelf = profile.id === currentUser?.id
                  const isUpdating = updatingUserId === profile.id
                  return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.full_name || "-"}{isSelf && <span className="ml-2 text-xs text-muted-foreground">You</span>}
                    </TableCell>
                    <TableCell>{profile.email || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {profile.role === "admin" ? <Shield className="h-4 w-4 text-primary" /> : <UserRound className="h-4 w-4 text-muted-foreground" />}
                        <select
                          aria-label={`Role for ${profile.email}`}
                          value={profile.role}
                          disabled={isUpdating || isSelf}
                          onChange={event => handleRoleChange(profile, event.target.value as Profile["role"])}
                          className="h-8 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          profile.status === "approved"
                            ? "active"
                            : profile.status === "pending"
                            ? "expiring"
                            : "expired"
                        }
                      >
                        {profile.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {profile.status !== "approved" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isUpdating || isSelf}
                            onClick={() => handleStatusChange(profile, "approved")}
                          >
                            <Check className="mr-1 h-4 w-4 text-emerald-600" />
                            {profile.status === "pending" ? "Approve" : "Reinstate"}
                          </Button>
                        )}
                        {profile.status !== "rejected" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            title="Reject or revoke access"
                            aria-label={`Reject ${profile.email}`}
                            disabled={isUpdating || isSelf}
                            onClick={() => handleStatusChange(profile, "rejected")}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {loading ? "Loading users..." : "No users match these filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
