"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import type { Evaluation, Patient } from "@/types/database";

export default function EvaluationsPage() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [form, setForm] = useState({
    evaluation_type: "",
    evaluation_date: new Date().toISOString().slice(0, 10),
    objective: "",
    observations: "",
    result: "",
    recommendations: "",
    status: "Em andamento",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!profile) return;

      const { data: allPatients } = await (supabase.from("patients") as any).select("*");
      const { data: allEvaluations } = await (supabase.from("evaluations") as any).select("*").order("evaluation_date", { ascending: false });

      setPatients((allPatients ?? []) as Patient[]);
      setEvaluations((allEvaluations ?? []) as Evaluation[]);
    };

    loadData();
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPatient) {
      return;
    }

    const { error } = await (supabase.from("evaluations") as any).insert([
      {
        patient_id: selectedPatient,
        created_by: profile?.id,
        ...form,
      },
    ]);

    if (!error) {
      setForm({
        evaluation_type: "",
        evaluation_date: new Date().toISOString().slice(0, 10),
        objective: "",
        observations: "",
        result: "",
        recommendations: "",
        status: "Em andamento",
      });
      const { data } = await (supabase.from("evaluations") as any).select("*").order("evaluation_date", { ascending: false });
      setEvaluations((data ?? []) as Evaluation[]);
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Avaliações</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Neuropsicológicas</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4" />
              Nova avaliação
            </Button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Cadastrar avaliação</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Paciente</label>
                  <Select value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)}>
                    <option value="">Selecione</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de avaliação</label>
                  <Input value={form.evaluation_type} onChange={(event) => setForm((prev) => ({ ...prev, evaluation_type: event.target.value }))} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Data</label>
                  <Input type="date" value={form.evaluation_date} onChange={(event) => setForm((prev) => ({ ...prev, evaluation_date: event.target.value }))} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Objetivo</label>
                  <Input value={form.objective ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, objective: event.target.value }))} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Observações</label>
                  <textarea value={form.observations ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, observations: event.target.value }))} className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Resultado</label>
                  <textarea value={form.result ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, result: event.target.value }))} className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Recomendações</label>
                  <textarea value={form.recommendations ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, recommendations: event.target.value }))} className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as typeof prev.status }))}>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </Select>
                </div>

                <Button type="submit" className="w-full">Salvar avaliação</Button>
              </form>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Histórico</h2>
              <Table
                headers={["Paciente", "Tipo", "Data", "Status"]}
                rows={evaluations.map((evaluation) => [
                  patients.find((patient) => patient.id === evaluation.patient_id)?.full_name ?? "-",
                  evaluation.evaluation_type,
                  new Date(evaluation.evaluation_date).toLocaleDateString("pt-BR"),
                  evaluation.status,
                ])}
              />
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
