"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import type { Attendance, Patient } from "@/types/database";

export default function AttendancesPage() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [attendances, setAttendances] = useState<(Attendance & { patients?: { full_name: string } | null })[]>([]);
  const [form, setForm] = useState({ patient_id: "", attendance_date: new Date().toISOString().slice(0, 10), attendance_time: "", status: "Presente", notes: "" });
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!profile) return;
    const [{ data: patientData }, { data: attendanceData }] = await Promise.all([
      (supabase.from("patients") as any).select("*").order("full_name"),
      (supabase.from("attendances") as any).select("*, patients(full_name)").order("attendance_date", { ascending: false }),
    ]);
    setPatients((patientData ?? []) as Patient[]); setAttendances((attendanceData ?? []) as (Attendance & { patients?: { full_name: string } | null })[]);
  };
  useEffect(() => { loadData(); }, [profile]);

  const saveAttendance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!profile || !form.patient_id) { setError("Selecione um paciente."); return; }
    setSaving(true); const { error: saveError } = await (supabase.from("attendances") as any).insert({ ...form, created_by: profile.id }); setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setForm({ ...form, patient_id: "", attendance_time: "", notes: "" }); setMessage("Presença registrada."); await loadData();
  };

  return <ProtectedPage><AppShell><div className="space-y-6">
    <div><p className="text-sm uppercase tracking-[0.25em] text-rose-600">Agenda clínica</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Presenças</h1></div>
    <Card><div className="mb-5 flex items-center gap-3"><Plus className="h-5 w-5 text-rose-600" /><div><h2 className="text-lg font-semibold">Registrar presença</h2><p className="text-sm text-slate-500">Registre o comparecimento do paciente.</p></div></div>
      <form onSubmit={saveAttendance} className="grid gap-4 md:grid-cols-2"><Select value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} required><option value="">Selecione o paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.full_name}</option>)}</Select><Input type="date" value={form.attendance_date} onChange={(event) => setForm({ ...form, attendance_date: event.target.value })} required /><Input type="time" value={form.attendance_time} onChange={(event) => setForm({ ...form, attendance_time: event.target.value })} required /><Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Presente</option><option>Ausente</option><option>Justificado</option><option>Cancelado</option></Select><Input className="md:col-span-2" placeholder="Observações" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /><div className="flex items-center gap-3 md:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Registrar presença"}</Button>{error ? <span className="text-sm text-red-600">{error}</span> : null}{message ? <span className="text-sm text-emerald-600">{message}</span> : null}</div></form>
    </Card>
    <Card><h2 className="mb-4 text-lg font-semibold">Registros recentes</h2><div className="divide-y divide-slate-100">{attendances.length ? attendances.map((attendance) => <div key={attendance.id} className="flex items-start gap-3 py-4"><CalendarCheck2 className="mt-1 h-5 w-5 text-rose-600" /><div><p className="font-medium text-slate-900">{attendance.patients?.full_name ?? "Paciente"}</p><p className="text-sm text-slate-500">{attendance.attendance_date} às {attendance.attendance_time} · {attendance.status}</p></div></div>) : <p className="text-sm text-slate-500">Nenhuma presença registrada.</p>}</div></Card>
  </div></AppShell></ProtectedPage>;
}