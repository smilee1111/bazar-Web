
export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section className="h-screen">
            <div>My app</div>
            {children}
            <div>2025  @ My app</div>
        </section>
    );
}