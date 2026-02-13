import { Shield, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Settings</p>
                <h1 className="text-4xl font-bold text-white">Security</h1>
                <p className="text-white/75 text-lg">Review your security preferences.</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15">
                            <Shield className="h-5 w-5 text-[#8f7e4f]" />
                        </span>
                        <div>
                            <CardTitle className="text-xl text-[#1a1a1a]">Security Center</CardTitle>
                            <CardDescription>Security updates and account protection status.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-[#4a4a4a]">
                    <div className="flex items-center gap-3 rounded-lg border border-[#e8e1cf] bg-white p-4">
                        <Lock className="h-5 w-5 text-[#8f7e4f]" />
                        <div>
                            <p className="font-medium text-[#1a1a1a]">Password & login</p>
                            <p>Manage your password and login security from your profile page.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
