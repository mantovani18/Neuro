"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { brazilianCPF, validEmail } from "@/lib/utils";
import type { Patient } from "@/types/database";

export default function PatientsPage() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [form, setForm] = useState({
    full_name: "",
    cpf: "",
    birth_date: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    responsible_name: "",
    responsible_phone: "",
    notes: "",
    status: "Ativo",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === "ADMIN";

  const loadPatients = async () => {
    if (!profile) return;

    let query = supabase.from("patients").select("*").order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("created_by", profile.id);
    }

    const { data } = await query;
    setPatients((data ?? []) as Patient[]);
  };

  useEffect(() => {
    loadPatients();
  }, [profile, isAdmin]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (patient.cpf ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Todos" || patient.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.full_name.trim()) {
      setFormError("Nome completo é obrigatório.");
      return;
    }

    if (form.cpf && !brazilianCPF(form.cpf)) {
      setFormError("CPF inválido. Informe 11 dígitos.");
      return;
    }

    if (form.email && !validEmail(form.email)) {
      setFormError("E-mail inválido.");
      return;
    }

    setLoading(true);

    const payload: any = {
      ...form,
      created_by: profile?.id,
      status: form.status as Patient["status"],
    };

    const { error } = await (supabase.from("patients") as any).insert([payload]);

    setLoading(false);

    if (error) {
      setFormError(error.message || "Não foi possível salvar o paciente.");
      return;
    }

    setForm({
      full_name: "",
      cpf: "",
      birth_date: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      responsible_name: "",
      responsible_phone: "",
      notes: "",
      status: "Ativo",
    });

    loadPatients();
  };

  const handleArchive = async (patientId: string) => {
    const { error } = await (supabase.from("patients") as any)
      .update({ status: "Arquivado" })
      .eq("id", patientId);

    if (!error) {
      loadPatients();
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Pacientes</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Cadastro e gestão</h1>
            </div>
            <Button>
              <Plus className="h-4 w-4" />
              Novo paciente
            </Button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_1.6fr]">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Cadastrar paciente</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nome completo</label>
                    <Input value={form.full_name} onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">CPF</label>
                    <Input value={form.cpf} onChange={(event) => setForm((prev) => ({ ...prev, cpf: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Data de nascimento</label>
                    <Input type="date" value={form.birth_date} onChange={(event) => setForm((prev) => ({ ...prev, birth_date: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Sexo</label>
                    <Select value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}>
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Não informado">Não informado</option>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
                    <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
                    <Input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Endereço</label>
                    <Input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Responsável</label>
                    <Input value={form.responsible_name} onChange={(event) => setForm((prev) => ({ ...prev, responsible_name: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Telefone do responsável</label>
                    <Input value={form.responsible_phone} onChange={(event) => setForm((prev) => ({ ...prev, responsible_phone: event.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Observações</label>
                    <textarea
                      value={form.notes}
                      onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                      className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                    <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                      <option value="Ativo">Ativo</option>
                      <option value="Arquivado">Arquivado</option>
                    </Select>
                  </div>
                </div>

                {formError ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : "Salvar paciente"}
                </Button>
              </form>
            </Card>

            <Card>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Lista de pacientes</h2>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full pl-9 sm:w-52" placeholder="Buscar paciente" />
                  </div>
                  <Select value={filter} onChange={(event) => setFilter(event.target.value)} className="sm:w-40">
                    <option value="Todos">Todos</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Arquivado">Arquivado</option>
                  </Select>
                </div>
              </div>

              <Table
                headers={["Paciente", "CPF", "Status", "Responsável", "Ações"]}
                rows={filteredPatients.map((patient) => [
                  <div key={patient.id}>
                    <p className="font-medium text-slate-900">{patient.full_name}</p>
                    <p className="text-xs text-slate-500">{patient.email || "Sem e-mail"}</p>
                  </div>,
                  patient.cpf || "-",
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${patient.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                    {patient.status}
                  </span>,
                  patient.responsible_name || "-",
                  <div className="flex gap-2">
                    <a href={`/pacientes/${patient.id}`} className="rounded-lg bg-sky-50 p-2 text-sky-700">
                      <Pencil className="h-4 w-4" />
                    </a>
                    <button onClick={() => handleArchive(patient.id)} className="rounded-lg bg-red-50 p-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>,
                ])}
              />
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
