import type { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#8f7e4f] via-[#7a6b45] to-[#6b5d3c]">
            <div
                className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center opacity-10"
                style={{ backgroundImage: "url('/images/auth-background.svg')" }}
            />

            <div className="relative z-10 flex min-h-screen">
                <Sidebar />

                <main className="flex-1 overflow-y-auto px-6 py-10 md:px-10">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
