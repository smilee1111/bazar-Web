import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface RoleOption {
  id: string;
  value: string;
  label: string;
}

interface RoleSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  roles: RoleOption[];
  loading?: boolean;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  emptyText?: string;
  id?: string;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
}

export function RoleSelect({
  value,
  onValueChange,
  roles,
  loading = false,
  label = "Role",
  required = false,
  disabled = false,
  placeholder = "Select a role",
  error,
  emptyText = "No roles available",
  id = "role",
  className,
  labelClassName,
  triggerClassName,
}: RoleSelectProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn("font-normal text-[#524632] text-base", labelClassName)}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || loading || !roles.length}
      >
        <SelectTrigger
          id={id}
          disabled={disabled || loading || !roles.length}
          className={cn("h-[50px] rounded-[10px] border-[1.2px]", triggerClassName)}
        >
          <SelectValue placeholder={loading ? "Loading roles..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading roles...</div>
          ) : roles.length ? (
            roles.map((role) => (
              <SelectItem key={role.id} value={role.value}>
                {role.label}
              </SelectItem>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
