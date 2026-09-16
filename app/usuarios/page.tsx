"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "ATENDENTE" });

  const loadUsers = async () => {
    if (profile?.role !== "ADMIN") {
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase.from("profiles").select("*").order("full_name");
    setUsers((data ?? []) as Profile[]);
    setError(queryError?.message ?? "");
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [profile]);

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setMessage("");
    setSaving(true);

    const response = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setFormError(result.error ?? "Não foi possível cadastrar o atendente.");
      return;
    }

    setForm({ full_name: "", email: "", password: "", role: "ATENDENTE" });
    setMessage("Atendente cadastrado com sucesso. Ele já pode entrar com o e-mail e a senha informados.");
    setLoading(true);
    await loadUsers();
  };

  const deleteUser = async (user: Profile) => {
    if (user.id === profile?.id || !window.confirm(`Remover o usuário ${user.full_name}?`)) return;
    setFormError("");
    setMessage("");
    const response = await fetch("/api/usuarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    const result = await response.json();
    if (!response.ok) {
      setFormError(result.error ?? "Não foi possível remover o usuário.");
      return;
    }
    setMessage("Usuário removido.");
    setLoading(true);
    await loadUsers();
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-violet-600">Administração</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Usuários / Atendentes</h1>
            <p className="mt-2 text-sm text-slate-600">Consulte os profissionais cadastrados na clínica.</p>
          </div>

          {profile?.role !== "ADMIN" ? (
            <Card><p className="text-sm text-slate-600">Apenas administradores podem acessar esta área.</p></Card>
          ) : (
            <Card>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Cadastrar usuário</h2>
                  <p className="mt-1 text-sm text-slate-500">A conta será criada no Supabase Auth com o perfil escolhido.</p>
                </div>
                <Plus className="h-5 w-5 text-violet-600" />
              </div>
              <form onSubmit={createUser} className="grid gap-4 md:grid-cols-4">
                <Input placeholder="Nome completo" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required />
                <Input type="email" placeholder="E-mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                <Input type="password" placeholder="Senha inicial (mín. 6)" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option value="ATENDENTE">Atendente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <div className="md:col-span-4 flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={saving}>{saving ? "Cadastrando..." : "Cadastrar usuário"}</Button>
                  {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
                  {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
                </div>
              </form>
            </Card>
          )}

          {profile?.role === "ADMIN" && (loading ? (
            <Card><p className="text-sm text-slate-600">Carregando usuários...</p></Card>
          ) : error ? (
            <Card><p className="text-sm text-red-600">Não foi possível carregar os usuários: {error}</p></Card>
          ) : loading ? (
            <Card><p className="text-sm text-slate-600">Carregando usuários...</p></Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-5 py-4">Profissional</th><th className="px-5 py-4">E-mail</th><th className="px-5 py-4">Perfil</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700"><UserRound className="h-4 w-4" /></span><span className="font-medium text-slate-900">{user.full_name}</span></div></td>
                        <td className="px-5 py-4 text-slate-600">{user.email}</td>
                        <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{user.role === "ADMIN" ? <ShieldCheck className="h-3.5 w-3.5" /> : null}{user.role}</span></td>
                        <td className="px-5 py-4 text-slate-600">{user.active ? "Ativo" : "Inativo"}</td>
                        <td className="px-5 py-4 text-right"><Button type="button" variant="danger" size="sm" disabled={user.id === profile?.id} onClick={() => deleteUser(user)} title={user.id === profile?.id ? "Você não pode remover sua própria conta" : "Remover usuário"}><Trash2 className="h-4 w-4" /><span className="sr-only">Remover</span></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      </AppShell>
    </ProtectedPage>
  );
}