"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { userService } from "@/services/userService";
import { User, UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  Search,
  Eye,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
  Users,
  PlusCircle,
} from "lucide-react";

const roleColors: Record<UserRole, string> = {
  STARTUP: "bg-blue-100 text-blue-700",
  INVESTOR: "bg-purple-100 text-purple-700",
  EVALUATOR: "bg-yellow-100 text-yellow-700",
  ADMIN: "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users", roleFilter, search],
    queryFn: async () => {
      const data = await userService.getAllUsers({
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        search: search || undefined,
      });
      return data ?? [];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleActivate = async (id: string) => {
    try {
      await userService.activateUser(id);
      toast.success("User activated.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Failed to activate user.");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await userService.deactivateUser(id);
      toast.success("User deactivated.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Failed to deactivate user.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?"))
      return;
    try {
      await userService.deleteUser(id);
      toast.success("User deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            User Management
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            Manage all users across the platform
          </p>
        </div>
        <Link href="/admin/users/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
            <Input
              placeholder="Search by name or email…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          {(["ALL", "STARTUP", "INVESTOR", "EVALUATOR", "ADMIN"] as const).map(
            (role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  roleFilter === role
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "bg-white text-[var(--color-neutral-600)] border-[var(--color-border)] hover:border-[var(--color-primary-200)]"
                }`}
              >
                {role}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : users.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--color-border)]">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Users className="h-10 w-10 text-[var(--color-neutral-400)]" />
            <p className="text-[var(--color-neutral-500)]">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card
              key={user.id}
              className="border border-[var(--color-border)] hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
                          {user.fullName}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            roleColors[user.role]
                          }`}
                        >
                          {user.role}
                        </span>
                        <Badge
                          variant={(user.enabled ?? user.isActive) ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {(user.enabled ?? user.isActive) ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--color-neutral-400)] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {(user.enabled ?? user.isActive) ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Deactivate"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        <UserX className="h-4 w-4 text-yellow-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Activate"
                        onClick={() => handleActivate(user.id)}
                      >
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}