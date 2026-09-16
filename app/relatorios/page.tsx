"use client";

import { useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import type { Patient, Report } from "@/types/database";

export default function ReportsPage() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<(Report & { patients?: { full_name: string } | null })[]>([]);
  const [form, setForm] = useState({ patient_id: "", title: "", report_type: "Avaliação neuropsicológica", report_date: new Date().toISOString().slice(0, 10), content: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!profile) return;
    const [{ data: patientData }, { data: reportData }] = await Promise.all([
      (supabase.from("patients") as any).select("*").order("full_name"),
      (supabase.from("reports") as any).select("*, patients(full_name)").order("report_date", { ascending: false }),
    ]);
    setPatients((patientData ?? []) as Patient[]);
    setReports((reportData ?? []) as (Report & { patients?: { full_name: string } | null })[]);
  };

  useEffect(() => { loadData(); }, [profile]);

  const saveReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!profile || !form.patient_id) { setError("Selecione um paciente."); return; }
    setSaving(true);
    const { error: saveError } = await (supabase.from("reports") as any).insert({ ...form, created_by: profile.id });
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setForm({ ...form, patient_id: "", title: "", content: "" }); setMessage("Relatório cadastrado."); await loadData();
  };

  return <ProtectedPage><AppShell><div className="space-y-6">
    <div><p className="text-sm uppercase tracking-[0.25em] text-amber-600">Clínica</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Relatórios</h1></div>
    <Card><div className="mb-5 flex items-center gap-3"><Plus className="h-5 w-5 text-amber-600" /><div><h2 className="text-lg font-semibold">Novo relatório</h2><p className="text-sm text-slate-500">Registre um relatório vinculado a um paciente.</p></div></div>
      <form onSubmit={saveReport} className="grid gap-4 md:grid-cols-2">
        <Select value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} required><option value="">Selecione o paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.full_name}</option>)}</Select>
        <Input placeholder="Título do relatório" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <Input placeholder="Tipo de relatório" value={form.report_type} onChange={(event) => setForm({ ...form, report_type: event.target.value })} required />
        <Input type="date" value={form.report_date} onChange={(event) => setForm({ ...form, report_date: event.target.value })} required />
        <textarea className="min-h-28 rounded-xl border border-slate-200 p-3 text-sm md:col-span-2" placeholder="Conteúdo e observações" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
        <div className="flex items-center gap-3 md:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar relatório"}</Button>{error ? <span className="text-sm text-red-600">{error}</span> : null}{message ? <span className="text-sm text-emerald-600">{message}</span> : null}</div>
      </form>
    </Card>
    <Card><h2 className="mb-4 text-lg font-semibold">Relatórios cadastrados</h2><div className="divide-y divide-slate-100">{reports.length ? reports.map((report) => <div key={report.id} className="flex items-start gap-3 py-4"><FileText className="mt-1 h-5 w-5 text-amber-600" /><div><p className="font-medium text-slate-900">{report.title}</p><p className="text-sm text-slate-500">{report.patients?.full_name ?? "Paciente"} · {report.report_date} · {report.report_type}</p></div></div>) : <p className="text-sm text-slate-500">Nenhum relatório cadastrado.</p>}</div></Card>
  </div></AppShell></ProtectedPage>;
}