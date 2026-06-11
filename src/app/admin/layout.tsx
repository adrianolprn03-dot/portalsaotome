import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <>{children}</>;
    }

    const userRole = (session.user as any)?.role || "admin";

    return (
        <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-800">
            <AdminSidebar userRole={userRole} />
            
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Elementos decorativos sutis ao fundo do conteúdo */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />

                {/* Header administrativo unificado */}
                <AdminHeader session={session} />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 relative z-10 w-full max-w-[1400px] mx-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
