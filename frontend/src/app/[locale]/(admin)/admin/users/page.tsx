"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");
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

  const toggleStatusMutation = useMutation({
    mutationFn: async (user: User) => {
      const isActive = user.enabled ?? user.isActive;
      if (isActive) {
        await userService.deactivateUser(user.id);
      } else {
        await userService.activateUser(user.id);
      }
    },
    onMutate: async (user) => {
      const queryKey = ["admin-users", roleFilter, search];
      await queryClient.cancelQueries({ queryKey });
      const previousUsers = queryClient.getQueryData<User[]>(queryKey);
      queryClient.setQueryData<User[]>(queryKey, (old) =>
        old?.map((u) => {
          if (u.id !== user.id) return u;
          const nextActive = !(u.enabled ?? u.isActive);
          return { ...u, enabled: nextActive, isActive: nextActive };
        })
      );
      return { previousUsers, queryKey };
    },
    onError: (_err, user, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousUsers);
      }
      const isActive = user.enabled ?? user.isActive;
      toast.error(isActive ? t("toastDeactivateFailed") : t("toastActivateFailed"));
    },
    onSuccess: (_data, user) => {
      const wasActive = user.enabled ?? user.isActive;
      toast.success(wasActive ? t("toastDeactivated") : t("toastActivated"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete")))
      return;
    try {
      await userService.deleteUser(id);
      toast.success(t("toastDeleted"));
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error(t("toastDeleteFailed"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-800)]">
            {t("title")}
          </h2>
          <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/admin/users/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t("createUser")}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-400)]" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            {tCommon("search")}
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
                {role === "ALL" ? t("allRoles") : tCommon(`roles.${role.toLowerCase()}`)}
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
            <p className="text-[var(--color-neutral-500)]">{t("noUsersFound")}</p>
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
                          {tCommon(`roles.${user.role.toLowerCase()}`)}
                        </span>
                        <Badge
                          variant={(user.enabled ?? user.isActive) ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {(user.enabled ?? user.isActive) ? tCommon("status.active") : tCommon("status.inactive")}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--color-neutral-400)] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="icon" title={t("view")}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {(user.enabled ?? user.isActive) ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("deactivate")}
                        onClick={() => toggleStatusMutation.mutate(user)}
                        disabled={toggleStatusMutation.isPending}
                      >
                        <UserX className="h-4 w-4 text-yellow-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("activate")}
                        onClick={() => toggleStatusMutation.mutate(user)}
                        disabled={toggleStatusMutation.isPending}
                      >
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("delete")}
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