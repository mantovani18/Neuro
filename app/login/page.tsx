"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [router, session]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message || "Não foi possível entrar. Verifique as credenciais.");
      return;
    }

    router.push("/dashboard");
  };

  const handleRecovery = async () => {
    if (!email) {
      setMessage("Informe o e-mail para recuperar a senha.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setMessage(error.message || "Não foi possível enviar o e-mail de recuperação.");
      return;
    }

    setMessage("E-mail de recuperação enviado com sucesso.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hidden bg-gradient-to-br from-sky-600 via-cyan-500 to-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-100">NeuroPsico</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Gestão inteligente para uma clínica neuropsicológica.</h1>
          </div>

          <div className="space-y-4 text-sm text-sky-50">
            <p>Centralize pacientes, avaliações, relatórios, presença e documentos em uma plataforma segura.</p>
            <div className="grid gap-3 text-left">
              <div>• Dashboard com indicadores clínicos</div>
              <div>• Segurança com Supabase Auth e RLS</div>
              <div>• Fluxo profissional para atendentes e administradores</div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Acesso</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Entrar no sistema</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            {message ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {message}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm font-medium text-sky-700 underline-offset-4 hover:underline"
              onClick={handleRecovery}
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
