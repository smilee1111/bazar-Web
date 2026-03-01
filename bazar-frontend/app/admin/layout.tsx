"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "../(dashboard)/_components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="relative min-h-screen bg-[#F7F5F2]">
            <div
                className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center opacity-5"
                style={{ backgroundImage: "url('/images/auth-background.svg')" }}
            />

            <div className="relative z-10 flex min-h-screen">
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
                />

                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">
                    <div className={sidebarCollapsed ? "mx-0 max-w-none" : "mx-auto max-w-7xl"}>
                        <div className="flex justify-end mb-4">
                            <NotificationBell />
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
