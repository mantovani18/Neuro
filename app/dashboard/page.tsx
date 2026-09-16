"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarClock, FileText, Stethoscope, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalPacientes: 0,
    pacientesAtivos: 0,
    avaliacoes: 0,
    relatorios: 0,
    presencas: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!profile) return;

      const isAdmin = profile.role === "ADMIN";

      const patientQuery: any = (supabase.from("patients") as any)
        .select("id, status, created_by", { count: "exact" });

      if (!isAdmin) {
        patientQuery.eq("created_by", profile.id);
      }

      const { data: patients = [], count: patientCount } = await patientQuery;
      const patientsList = Array.isArray(patients) ? patients : [];

      const { data: evaluations = [] } = await (supabase.from("evaluations") as any).select("id");
      const { data: reports = [] } = await (supabase.from("reports") as any).select("id");
      const { data: attendances = [] } = await (supabase.from("attendances") as any).select("id");

      setStats({
        totalPacientes: patientCount ?? patientsList.length,
        pacientesAtivos: patientsList.filter((patient: any) => patient.status === "Ativo").length,
        avaliacoes: Array.isArray(evaluations) ? evaluations.length : 0,
        relatorios: Array.isArray(reports) ? reports.length : 0,
        presencas: Array.isArray(attendances) ? attendances.length : 0,
      });
    };

    loadStats();
  }, [profile]);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Bem-vindo(a), {profile?.full_name ?? "Profissional"}</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Meus pacientes" value={stats.totalPacientes} icon={Users} accent="sky" />
            <MetricCard label="Pacientes ativos" value={stats.pacientesAtivos} icon={Activity} accent="emerald" />
            <MetricCard label="Avaliações" value={stats.avaliacoes} icon={Stethoscope} accent="violet" />
            <MetricCard label="Relatórios" value={stats.relatorios} icon={FileText} accent="amber" />
            <MetricCard label="Presenças" value={stats.presencas} icon={CalendarClock} accent="rose" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumo da clínica</h2>
              <div className="space-y-4">
                <div className="rounded-xl bg-sky-50 p-4">
                  <p className="text-sm font-medium text-sky-700">Atendimentos este mês</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pacientesAtivos}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-violet-50 p-4">
                    <p className="text-sm text-violet-700">Avaliações realizadas</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stats.avaliacoes}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-sm text-amber-700">Relatórios emitidos</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stats.relatorios}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Atalhos</h2>
              <div className="space-y-3">
                <Shortcut href="/pacientes" label="Novo paciente" />
                <Shortcut href="/presencas" label="Registrar presença" />
                <Shortcut href="/avaliacoes" label="Nova avaliação" />
                <Shortcut href="/relatorios" label="Novo relatório" />
              </div>
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  accent: "sky" | "emerald" | "violet" | "amber" | "rose";
}) {
  const palette = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`rounded-xl p-3 ${palette[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}

function Shortcut({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
    >
      {label}
      <span>→</span>
    </a>
  );
}
