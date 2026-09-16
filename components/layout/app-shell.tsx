"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, FileText, CalendarCheck2, FileUp, Settings, LogOut, UserCircle2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/presencas", label: "Presenças", icon: CalendarCheck2 },
  { href: "/documentos", label: "Documentos", icon: FileUp },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-slate-900 text-slate-100 transition-transform duration-200 lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">NeuroPsico</p>
            <h1 className="text-lg font-semibold">Clínica</h1>
          </div>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-sky-500 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/usuarios"
              className={`mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                pathname === "/usuarios" || pathname.startsWith("/usuarios/") ? "bg-violet-500 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4" />
              Usuários / Atendentes
            </Link>
          )}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sistema</p>
                <h2 className="text-lg font-semibold text-slate-900">Clínica de NeuroPsico</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                <UserCircle2 className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{profile?.full_name ?? "Usuário"}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{profile?.role}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => signOut()} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
    </div>
  );
}
