import { notFound } from "next/navigation";
import { fetchAdminUserAction } from "@/lib/actions/admin-user-action";
import AdminUserForm from "../../_components/AdminUserForm";

interface Params {
    params: {
        id: string;
    };
}

export default async function EditAdminUserPage({ params }: Params) {
    const result = await fetchAdminUserAction(params.id);
    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#070a12,_#010203)] py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 text-white">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">Edit record</p>
                    <h1 className="text-4xl font-semibold">{result.data.fullName}</h1>
                    <p className="text-white/60">ID • {params.id}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur">
                    <AdminUserForm mode="edit" user={result.data} />
                </div>
            </div>
        </div>
    );
}
