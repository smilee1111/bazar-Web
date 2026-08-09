import ResetPasswordForm from "../_components/ResetPasswordForm";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const query = await searchParams;
    const token = query.token ? (query.token as string) : '';

    return (
        <div className="relative w-full min-h-screen bg-neutral-50 flex">
            {/* Left Panel */}
            <section className="relative w-full lg:w-[57%] min-h-screen bg-gradient-to-br from-[#142A1C] via-[#1A3625] to-[#1B4A31] overflow-hidden">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-5"
                    style={{ backgroundImage: "url('/images/auth-background.svg')" }}
                />

                <div className="relative z-10 flex min-h-screen flex-col w-full max-w-[520px] px-4 lg:px-[60px] pt-[23px] pb-12">
                    <header className="flex items-center gap-3">
                        <div className="flex w-12 h-12 items-center justify-center bg-white/20 rounded-2xl border-[1.2px] border-white/30">
                            <img
                                className="w-8 h-8 object-contain"
                                alt="HaatKhoj logo"
                                src="/images/HaatKhoj.svg"
                            />
                        </div>
                        <h1 className="font-normal text-white text-[32px] tracking-[-0.32px] leading-[41.6px]">
                            HaatKhoj
                        </h1>
                    </header>

                    <div className="mt-12 flex flex-col gap-10 animate-fade-up">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Reset Password</p>
                            <h2 className="font-semibold text-white text-3xl lg:text-[40px] tracking-[-0.6px] leading-snug">
                                Set New Password
                            </h2>

                            <p className="font-normal text-white text-base lg:text-lg leading-relaxed text-white/90">
                                Choose a strong password for your account. Make sure it's secure and easy to remember.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Panel */}
            <section className="relative w-[43%] flex items-start justify-center pt-[23px] px-8 bg-white">
                <div className="w-full max-w-[576px]">
                    <ResetPasswordForm token={token} />
                </div>
            </section>
        </div>
    );
}