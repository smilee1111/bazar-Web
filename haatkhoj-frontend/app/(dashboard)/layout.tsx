"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "./_components/Sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="relative min-h-screen bg-[#F1FAF5]">
            <div className="relative z-10 flex min-h-screen">
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
                />

                <main className="min-w-0 flex-1 overflow-y-auto px-6 py-8 md:px-10">
                    <div className={sidebarCollapsed ? "mx-0 max-w-none" : "mx-auto max-w-7xl"}>
                        <div className="flex justify-end mb-6">
<NotificationBell />
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
