"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AdminUser } from "../page";

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  formatRole: (user: AdminUser) => string;
  onDelete: (id: string) => Promise<void> | void;
  rolesLoading?: boolean;
}

export default function UsersTable({ users, loading, error, formatRole, onDelete, rolesLoading }: UsersTableProps) {
  if (loading) {
    return <div className="px-6 py-4 text-sm text-[#4a4a4a]">Loading users...</div>;
  }

  if (error) {
    return <div className="px-6 py-4 text-sm text-red-600">{error}</div>;
  }

  if (!users.length) {
    return <div className="px-6 py-4 text-sm text-[#4a4a4a]">No users found.</div>;
  }

  return (
    <div className="divide-y divide-[#f1f1f1]">
      {users.map((user) => (
        <div key={user._id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#1a1a1a]">{user.fullName || "Unnamed"}</p>
            <p className="text-sm text-[#4a4a4a]">{user.email || "No email"}</p>
            {user.username && <p className="text-xs text-[#7a6b45]">@{user.username}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#8f7e4f]/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7a6b45]">
              {rolesLoading ? "Loading..." : formatRole(user)}
            </span>
            <Separator orientation="vertical" className="hidden h-8 bg-[#e9e9e9] sm:block" />
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/users/${user._id}`}>
                <Button variant="outline" className="border-[#8f7e4f]/40 text-[#7a6b45] hover:bg-[#8f7e4f]/10" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </Link>
              <Link href={`/admin/users/${user._id}/edit`}>
                <Button variant="outline" className="border-[#8f7e4f]/40 text-[#7a6b45] hover:bg-[#8f7e4f]/10" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete user?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The user will be removed permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => onDelete(user._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
