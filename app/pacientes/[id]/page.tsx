"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@/types/database";

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState<"informacoes" | "avaliacoes" | "relatorios" | "presencas" | "documentos" | "historico">("informacoes");

  useEffect(() => {
    const loadPatient = async () => {
      if (!params.id) return;

      const { data } = await (supabase.from("patients") as any).select("*").eq("id", params.id).maybeSingle();
      setPatient((data as unknown as Patient) ?? null);
    };

    loadPatient();
  }, [params.id]);

  if (!patient) {
    return (
      <ProtectedPage>
        <AppShell>
          <Card>Carregando paciente...</Card>
        </AppShell>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Paciente</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{patient.full_name}</h1>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${patient.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
              {patient.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["informacoes", "Informações"],
              ["avaliacoes", "Avaliações"],
              ["relatorios", "Relatórios"],
              ["presencas", "Presenças"],
              ["documentos", "Documentos"],
              ["historico", "Histórico"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value as typeof tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${tab === value ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "informacoes" && <PatientInfo patient={patient} />}
          {tab === "avaliacoes" && <PlaceholderSection title="Avaliações" />}
          {tab === "relatorios" && <PlaceholderSection title="Relatórios" />}
          {tab === "presencas" && <PlaceholderSection title="Presenças" />}
          {tab === "documentos" && <PlaceholderSection title="Documentos" />}
          {tab === "historico" && <PlaceholderSection title="Histórico" />}
        </div>
      </AppShell>
    </ProtectedPage>
  );
}

function PatientInfo({ patient }: { patient: Patient }) {
  return (
    <Card>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dados pessoais</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>Nome:</strong> {patient.full_name}</p>
              <p><strong>CPF:</strong> {patient.cpf || "-"}</p>
              <p><strong>Data de nascimento:</strong> {formatDate(patient.birth_date)}</p>
              <p><strong>Sexo:</strong> {patient.gender || "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contato</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>Telefone:</strong> {patient.phone || "-"}</p>
              <p><strong>E-mail:</strong> {patient.email || "-"}</p>
              <p><strong>Endereço:</strong> {patient.address || "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Responsável</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>Nome:</strong> {patient.responsible_name || "-"}</p>
              <p><strong>Telefone:</strong> {patient.responsible_phone || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-600">A funcionalidade de {title.toLowerCase()} estará disponível após a configuração do banco Supabase e as policies de acesso.</p>
    </Card>
  );
}
