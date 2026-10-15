import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "@/lib/router-shim";
import { DeluxLogo } from "@/components/common/DeluxLogo";
import { PrimaryButton } from "@/components/common/Buttons";
import { FormField } from "@/components/common/CommonComponents";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Delux" },
      { name: "description", content: "Defina uma nova senha para sua conta Delux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: password.trim() });
    setLoading(false);
    if (err) {
      setError("Não foi possível redefinir a senha. Abra novamente o link enviado por e-mail.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/app/inicio", { replace: true }), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0E14] text-[#17191D] dark:text-[#F1F5F9] flex flex-col justify-center items-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col items-center text-center mb-6">
          <DeluxLogo size="lg" className="mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Definir nova senha</h1>
          <p className="text-xs sm:text-sm text-[#777D87] dark:text-slate-400 mt-1">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        {done ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center font-medium">
            Senha atualizada com sucesso. Redirecionando…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}
            <FormField
              label="Nova senha (mínimo 6 caracteres)"
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Crie sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PrimaryButton type="submit" loading={loading} className="w-full">
              Salvar nova senha
            </PrimaryButton>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-[#777D87] dark:text-slate-400">
          <Link to="/login" className="font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
