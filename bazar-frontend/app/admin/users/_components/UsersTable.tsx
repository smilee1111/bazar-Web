"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, User, Mail, AtSign, Shield, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/DeleteModal";
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

interface Pagination {
  page: number;
  size: number;
  totalPages: number;
}

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  formatRole: (user: AdminUser) => string;
  onDelete: (id: string) => Promise<void> | void;
  rolesLoading?: boolean;
  pagination?: Pagination;
  searchQuery?: string;
  onPageChange?: (page: number) => void;
}

export default function UsersTable({
  users,
  loading,
  error,
  formatRole,
  onDelete,
  rolesLoading,
  pagination,
  searchQuery,
  onPageChange,
}: UsersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await onDelete(deleteId);
    setDeleteId(null);
  };

  const makePagination = (): React.ReactNode[] => {
    if (!pagination) return [];
    const pages: React.ReactNode[] = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    const delta = 2;

    const buildHref = (p: number) =>
      `/admin/users?page=${p}&size=${pagination.size}` + (searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "");

    const baseBtn = "px-3 py-1 rounded-md border transition-all duration-150 text-sm";
    const enabledClass = "bg-[#8f7e4f]/10 text-[#7a6b45] border-[#8f7e4f]/20 hover:bg-[#8f7e4f]/20";
    const activeClass = "bg-[#8f7e4f] text-white border-[#8f7e4f] shadow";
    const disabledClass = "bg-white text-gray-300 border-gray-200 cursor-not-allowed";

    // Prev
    const canPrev = currentPage > 1;
    // If server provided totalPages use that, otherwise assume there's a next page when current page has full page size
    const canNext = typeof totalPages === "number" && totalPages > 0 ? currentPage < totalPages : users.length === pagination.size;

    if (onPageChange) {
      pages.push(
        <button
          key="prev"
          onClick={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className={`${baseBtn} ${!canPrev ? disabledClass : enabledClass}`}
        >
          Previous
        </button>
      );
    } else {
      pages.push(
        <Link
          key="prev"
          href={currentPage === 1 ? "#" : buildHref(currentPage - 1)}
          className={`${baseBtn} ${currentPage === 1 ? disabledClass : enabledClass}`}
        >
          Previous
        </Link>
      );
    }

    let startPage = Math.max(1, currentPage - delta);
    let endPage = Math.min(totalPages, currentPage + delta);

    if (startPage > 1) {
      pages.push(
        <Link key={1} href={buildHref(1)} className={`${baseBtn} ${enabledClass}`}>
          1
        </Link>
      );
      if (startPage > 2) pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (onPageChange) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`${baseBtn} ${i === currentPage ? activeClass : enabledClass}`}
            aria-current={i === currentPage ? "page" : undefined}
          >
            {i}
          </button>
        );
      } else {
        pages.push(
          <Link
            key={i}
            href={buildHref(i)}
            className={`${baseBtn} ${i === currentPage ? activeClass : enabledClass}`}
            aria-current={i === currentPage ? "page" : undefined}
          >
            {i}
          </Link>
        );
      }
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
      pages.push(
        <Link key={totalPages} href={buildHref(totalPages)} className={`${baseBtn} ${enabledClass}`}>
          {totalPages}
        </Link>
      );
    }

    // Next
    if (onPageChange) {
      pages.push(
        <button
          key="next"
          onClick={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
          className={`${baseBtn} ${!canNext ? disabledClass : enabledClass}`}
        >
          Next
        </button>
      );
    } else {
      pages.push(
        <Link
          key="next"
          href={canNext ? buildHref(currentPage + 1) : "#"}
          className={`${baseBtn} ${!canNext ? disabledClass : enabledClass}`}
        >
          Next
        </Link>
      );
    }

    return pages;
  };

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
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete user?"
        description="This action cannot be undone. The user will be removed permanently from the system."
      />

      {users.map((user, index) => (
        <div
          key={user._id}
          className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/95"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12 ring-2 ring-[#8f7e4f]/20 shadow-md">
                <AvatarImage src={API_CONFIG.getImageUrl(user?.profilePic) || undefined} alt={user.fullName || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-[#8f7e4f] to-[#7a6b45] text-white font-semibold">
                  {(user.fullName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <h3 className="text-lg font-semibold text-[#1a1a1a] truncate">{user.fullName || "Unnamed User"}</h3>
                  <Badge variant="secondary" className="bg-[#8f7e4f]/10 text-[#7a6b45] border-[#8f7e4f]/20 w-fit">
                    {rolesLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border border-[#8f7e4f] border-t-transparent" />
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
                  <Button variant="outline" size="sm" className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href={`/admin/users/${user._id}/edit`}>
                  <Button variant="outline" size="sm" className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setDeleteId(user._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10">
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

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => setDeleteId(user._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      ))}

      {pagination && (
        <div className="flex items-center justify-between p-4 bg-white/80 rounded-md">
          <div className="text-sm text-[#4a4a4a]">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">{makePagination()}</div>
        </div>
      )}
    </div>
  );
}
