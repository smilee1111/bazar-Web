import { Shield, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Settings</p>
                <h1 className="text-4xl font-bold text-[#142A1C]">Security</h1>
                <p className="text-gray-500 text-lg">Review your security preferences.</p>
            </div>

            <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#267A4C]/15">
                            <Shield className="h-5 w-5 text-[#267A4C]" />
                        </span>
                        <div>
                            <CardTitle className="text-xl text-[#142A1C]">Security Center</CardTitle>
                            <CardDescription>Security updates and account protection status.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-[#1B4A31]">
                    <div className="flex items-center gap-3 rounded-lg border border-[#DCF0E2] bg-white p-4">
                        <Lock className="h-5 w-5 text-[#267A4C]" />
                        <div>
                            <p className="font-medium text-[#142A1C]">Password & login</p>
                            <p>Manage your password and login security from your profile page.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
