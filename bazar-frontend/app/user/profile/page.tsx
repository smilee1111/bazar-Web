import { handleWhoAmI } from "@/lib/actions/auth-action";
import { notFound } from "next/navigation";
import UpdateForm from "./components/UpdateForm";

export default async function ProfilePage() {

    const result = await handleWhoAmI();
    if(!result.success){
        throw new Error(result.message || "some error occurred");
    }

    if(!result.data){
        notFound();
    }

    const user = result.data;
    const roleLabel = user?.roleMeta?.name || user?.role || "member";

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#102a43,_#020617)] py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-white/90">
                    <p className="uppercase tracking-[0.2em] text-xs text-white/50">Your workspace</p>
                    <h1 className="text-4xl md:text-5xl font-semibold mt-2">Profile &amp; identity</h1>
                    <p className="text-base md:text-lg text-white/70 max-w-2xl mt-2">
                        Keep your personal details up to date so other admins can recognize you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_rgba(3,7,18,0.35)] border border-white/10 p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full border border-neutral-300 text-xs uppercase tracking-widest text-neutral-600">
                                    Update profile
                                </span>
                                <span className="text-sm text-neutral-500">{user?.email}</span>
                            </div>
                            <h2 className="text-2xl font-semibold text-neutral-900 mt-4">Personal information</h2>
                        </div>
                        <UpdateForm user={user} />
                    </div>

                    <div className="bg-white/5 rounded-2xl border border-white/20 p-6 text-white space-y-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Status</p>
                            <h3 className="text-3xl font-semibold mt-2 capitalize">{roleLabel}</h3>
                            <p className="text-white/60 text-sm mt-2">
                                You&apos;re signed in as <span className="text-white font-medium">{user?.username}</span>.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[{ label: "Full name", value: user?.fullName }, { label: "Email", value: user?.email }, { label: "Username", value: user?.username }].map((item) => (
                                <div key={item.label} className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">{item.label}</p>
                                    <p className="text-lg font-semibold mt-1 text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gradient-to-r from-amber-500/80 to-orange-600/80 rounded-xl p-5 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Tip</p>
                            <p className="text-lg font-semibold mt-2">Use recognizable photos so your teammates trust invites instantly.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}