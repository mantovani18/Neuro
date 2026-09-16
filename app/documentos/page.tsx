"use client";

import { useEffect, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import type { DocumentRecord, Patient } from "@/types/database";

export default function DocumentsPage() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]); const [documents, setDocuments] = useState<(DocumentRecord & { patients?: { full_name: string } | null })[]>([]);
  const [patientId, setPatientId] = useState(""); const [file, setFile] = useState<File | null>(null); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    if (!profile) return;
    const [{ data: patientData }, { data: documentData }] = await Promise.all([(supabase.from("patients") as any).select("*").order("full_name"), (supabase.from("documents") as any).select("*, patients(full_name)").order("created_at", { ascending: false })]);
    setPatients((patientData ?? []) as Patient[]); setDocuments((documentData ?? []) as (DocumentRecord & { patients?: { full_name: string } | null })[]);
  };
  useEffect(() => { loadData(); }, [profile]);

  const uploadDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!profile || !patientId || !file) { setError("Selecione o paciente e um arquivo."); return; }
    setUploading(true); const filePath = `${profile.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
    if (uploadError) { setUploading(false); setError(uploadError.message); return; }
    const { error: insertError } = await (supabase.from("documents") as any).insert({ patient_id: patientId, uploaded_by: profile.id, file_name: file.name, file_path: filePath, file_type: file.type, file_size: file.size });
    setUploading(false); if (insertError) { setError(insertError.message); return; }
    setPatientId(""); setFile(null); setMessage("Documento enviado."); await loadData();
  };

  return <ProtectedPage><AppShell><div className="space-y-6">
    <div><p className="text-sm uppercase tracking-[0.25em] text-cyan-600">Arquivos clínicos</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Documentos</h1></div>
    <Card><div className="mb-5 flex items-center gap-3"><Upload className="h-5 w-5 text-cyan-600" /><div><h2 className="text-lg font-semibold">Enviar documento</h2><p className="text-sm text-slate-500">Associe um arquivo ao prontuário do paciente.</p></div></div><form onSubmit={uploadDocument} className="grid gap-4 md:grid-cols-2"><Select value={patientId} onChange={(event) => setPatientId(event.target.value)} required><option value="">Selecione o paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.full_name}</option>)}</Select><input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required className="h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /><div className="flex items-center gap-3 md:col-span-2"><Button type="submit" disabled={uploading}>{uploading ? "Enviando..." : "Enviar documento"}</Button>{error ? <span className="text-sm text-red-600">{error}</span> : null}{message ? <span className="text-sm text-emerald-600">{message}</span> : null}</div></form></Card>
    <Card><h2 className="mb-4 text-lg font-semibold">Documentos recentes</h2><div className="divide-y divide-slate-100">{documents.length ? documents.map((document) => <div key={document.id} className="flex items-start gap-3 py-4"><FileUp className="mt-1 h-5 w-5 text-cyan-600" /><div><p className="font-medium text-slate-900">{document.file_name}</p><p className="text-sm text-slate-500">{document.patients?.full_name ?? "Paciente"} · {document.file_type ?? "Arquivo"}</p></div></div>) : <p className="text-sm text-slate-500">Nenhum documento enviado.</p>}</div></Card>
  </div></AppShell></ProtectedPage>;
}