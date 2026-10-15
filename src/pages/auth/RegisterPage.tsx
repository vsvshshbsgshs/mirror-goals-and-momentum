import React, { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-shim';
import { useAuth } from '../../context/AuthContext';
import { DeluxLogo } from '../../components/common/DeluxLogo';
import { PrimaryButton } from '../../components/common/Buttons';
import { FormField } from '../../components/common/CommonComponents';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Preencha seu e-mail e sua senha.');
      return;
    }
    if (cleanPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await register(cleanEmail, cleanPassword);
      // Access granted - direct to the onboarding quiz
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      if (err.message === 'CONFIRM_EMAIL') {
        setAwaitingConfirmation(true);
      } else {
        setError(err.message || 'Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0E14] text-[#17191D] dark:text-[#F1F5F9] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors text-center">
          <div className="flex flex-col items-center text-center mb-4">
            <DeluxLogo size="lg" className="mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D] dark:text-white">
              Confirme seu e-mail
            </h1>
          </div>
          <p className="text-sm text-[#777D87] dark:text-slate-400">
            Enviamos um link de confirmação para <strong>{email.trim()}</strong>. Clique no link e
            depois faça login para começar sua jornada no Delux.
          </p>
          <div className="mt-6">
            <Link to="/login" className="font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline text-sm">
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0E14] text-[#17191D] dark:text-[#F1F5F9] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative transition-colors">
      {/* Top Corner Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" size="sm" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col items-center text-center mb-6">
          <DeluxLogo size="lg" className="mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D] dark:text-white">
            Comece no Delux
          </h1>
          <p className="text-xs sm:text-sm text-[#777D87] dark:text-slate-400 mt-1 max-w-xs">
            Acesso imediato com e-mail e senha. Sem confirmação no e-mail.
          </p>
        </div>

        <div className="mb-5 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium transition-colors">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Acesso direto sem verificação de e-mail: crie e use instantaneamente.</span>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="E-mail"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <FormField
            label="Senha (mínimo 4 caracteres)"
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Crie sua senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <PrimaryButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              Criar Conta e Acessar
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-[#777D87] dark:text-slate-400">
          Já possui uma conta?{' '}
          <Link to="/login?mode=login" className="font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
};
