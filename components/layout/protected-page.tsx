"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  return <ProtectedPageInner>{children}</ProtectedPageInner>;
}

function ProtectedPageInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, profile, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [isLoading, router, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-600">Carregando ambiente da clínica...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-lg font-semibold text-slate-900">Perfil não encontrado</h1>
          <p className="mt-2 text-sm text-slate-600">
            O login foi realizado, mas este usuário ainda não possui um perfil na tabela profiles.
            Execute o schema do Supabase ou crie o perfil para continuar.
          </p>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
            className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
