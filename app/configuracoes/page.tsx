"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Informe seu nome completo.");
      return;
    }

    if (!profile) return;

    setSaving(true);
    const { error: updateError } = await (supabase.from("profiles") as any)
      .update({ full_name: fullName.trim() })
      .eq("id", profile.id);
    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Não foi possível salvar as configurações.");
      return;
    }

    await refreshProfile();
    setMessage("Configurações salvas.");
  };

  const sendPasswordRecovery = async () => {
    setMessage("");
    setError("");
    if (!profile?.email) return;

    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (recoveryError) {
      setError(recoveryError.message || "Não foi possível enviar o e-mail.");
      return;
    }

    setMessage("E-mail para redefinir a senha enviado.");
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-600">Conta</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Configurações</h1>
            <p className="mt-2 text-sm text-slate-600">Atualize seus dados de acesso e perfil profissional.</p>
          </div>

          <Card>
            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Meu perfil</h2>
                <p className="mt-1 text-sm text-slate-500">O e-mail é gerenciado pelo Supabase Auth.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="full-name" className="text-sm font-medium text-slate-700">Nome completo</label>
                <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">E-mail</label>
                <Input id="email" value={profile?.email ?? ""} readOnly className="bg-slate-50" />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {message ? <p className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />{message}</p> : null}
              <Button type="submit" disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "Salvando..." : "Salvar alterações"}</Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Segurança</h2>
            <p className="mt-1 text-sm text-slate-500">Receba um link seguro para definir uma nova senha.</p>
            <Button type="button" variant="secondary" className="mt-4 gap-2" onClick={sendPasswordRecovery}><KeyRound className="h-4 w-4" />Redefinir minha senha</Button>
          </Card>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}