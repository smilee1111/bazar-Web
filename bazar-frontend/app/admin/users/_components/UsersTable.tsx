"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2, User, Mail, AtSign, Shield, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { API_CONFIG } from "@/lib/api/config";
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#4a4a4a]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8f7e4f] border-t-transparent"></div>
          <span className="text-sm font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8f7e4f]/10 mb-4">
          <User className="h-8 w-8 text-[#8f7e4f]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">No users found</h3>
        <p className="text-sm text-[#4a4a4a]">Start by adding your first user to the system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <div
          key={user._id}
          className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/95"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12 ring-2 ring-[#8f7e4f]/20 shadow-md">
                <AvatarImage
                  src={API_CONFIG.getImageUrl(user?.profilePic) || undefined}
                  alt={user.fullName || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#8f7e4f] to-[#7a6b45] text-white font-semibold">
                  {(user.fullName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] truncate">
                    {user.fullName || "Unnamed User"}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-[#8f7e4f]/10 text-[#7a6b45] border-[#8f7e4f]/20 w-fit"
                  >
                    {rolesLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border border-[#8f7e4f] border-t-transparent"></div>
                        Loading...
                      </div>
                    ) : (
                      formatRole(user)
                    )}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-[#4a4a4a]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#8f7e4f]" />
                    <span className="truncate">{user.email || "No email"}</span>
                  </div>
                  {user.username && (
                    <div className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-[#8f7e4f]" />
                      <span>@{user.username}</span>
                    </div>
                  )}
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#8f7e4f]" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex gap-2">
                <Link href={`/admin/users/${user._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/users/${user._id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#1a1a1a]">Delete user?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#4a4a4a]">
                        This action cannot be undone. The user will be removed permanently from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => onDelete(user._id)}
                      >
                        Delete User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Mobile dropdown menu */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/users/${user._id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/users/${user._id}/edit`} className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit User
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-[#1a1a1a]">Delete user?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[#4a4a4a]">
                            This action cannot be undone. The user will be removed permanently from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => onDelete(user._id)}
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
