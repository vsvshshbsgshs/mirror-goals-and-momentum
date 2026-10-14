import React, { useState } from 'react';
import { useNavigate, useSearchParams } from '@/lib/router-shim';
import { useAuth } from '../../context/AuthContext';
import { DeluxLogo } from '../../components/common/DeluxLogo';
import { PrimaryButton } from '../../components/common/Buttons';
import { FormField } from '../../components/common/CommonComponents';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'register' (default for first interaction) or 'login'
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    if (cleanPassword.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        // Direct access: registers and logs in immediately without email confirmation
        await register(cleanEmail, cleanPassword);
        navigate('/onboarding', { replace: true });
      } else {
        await login(cleanEmail, cleanPassword);
        navigate('/app/inicio', { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || 'Erro ao processar.';
      // Helpful redirection if user already exists
      if (mode === 'register' && msg.toLowerCase().includes('já existe')) {
        setError('Este e-mail já possui cadastro. Você pode alternar para "Já tenho conta".');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0E14] text-[#17191D] dark:text-[#F1F5F9] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative transition-colors">
      {/* Top Corner Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" size="sm" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <DeluxLogo size="lg" className="mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D] dark:text-white">
            {mode === 'register' ? 'Comece no Delux' : 'Acesse sua conta'}
          </h1>
          <p className="text-xs sm:text-sm text-[#777D87] dark:text-slate-400 mt-1 max-w-xs">
            {mode === 'register'
              ? 'Acesso imediato com e-mail e senha. Sem confirmação de e-mail.'
              : 'Digite seu e-mail e senha para continuar seu progresso.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-[#F2F4F8] dark:bg-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-[#17191D] dark:text-white shadow-xs'
                : 'text-[#777D87] dark:text-slate-400 hover:text-[#17191D] dark:hover:text-white'
            }`}
          >
            Criar Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-[#17191D] dark:text-white shadow-xs'
                : 'text-[#777D87] dark:text-slate-400 hover:text-[#17191D] dark:hover:text-white'
            }`}
          >
            Já tenho conta
          </button>
        </div>

        {/* No-confirmation badge */}
        <div className="mb-5 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium transition-colors">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {mode === 'register'
              ? 'Acesso direto e instantâneo: sem esperar link ou confirmação no e-mail.'
              : 'Login seguro e rápido direto no seu espaço de metas.'}
          </span>
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
            label="Senha"
            id="password"
            type="password"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            placeholder="Digite sua senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <PrimaryButton
            type="submit"
            loading={loading}
            className="w-full mt-2"
          >
            {mode === 'register' ? 'Criar e Acessar Agora' : 'Entrar no Delux'}
          </PrimaryButton>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-6 text-center text-xs text-[#777D87] dark:text-slate-400">
          {mode === 'register' ? (
            <>
              Já possui uma conta salva?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline cursor-pointer"
              >
                Entrar com e-mail e senha
              </button>
            </>
          ) : (
            <>
              Primeira vez por aqui?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline cursor-pointer"
              >
                Criar conta rápida
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
