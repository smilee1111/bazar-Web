import AdminUserForm from "../_components/AdminUserForm";

export default function CreateAdminUserPage() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#030712)] py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 text-white">
                <div>
                    <p className="uppercase tracking-[0.4em] text-xs text-white/50">New identity</p>
                    <h1 className="text-4xl font-semibold">Invite or craft a user</h1>
                    <p className="text-white/70 mt-2">All details are stored securely. Images are uploaded through Multer-backed FormData.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur">
                    <AdminUserForm mode="create" />
                </div>
            </div>
        </div>
    );
}
