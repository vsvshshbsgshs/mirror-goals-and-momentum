import React, { useState } from 'react';
import { Link } from '@/lib/router-shim';
import { DeluxLogo } from '../../components/common/DeluxLogo';
import { PrimaryButton } from '../../components/common/Buttons';
import { FormField } from '../../components/common/CommonComponents';
import { api } from '../../services/api';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
      setSubmitted(true);
    } catch {
      setMessage('Instruções enviadas para seu endereço de e-mail.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0B0E14] flex flex-col justify-center items-center px-4 py-12 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col items-center text-center mb-8">
          <DeluxLogo size="lg" className="mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17191D] dark:text-white">
            Recuperação de Acesso
          </h1>
          <p className="text-xs sm:text-sm text-[#777D87] dark:text-slate-400 mt-1 max-w-xs">
            Digite seu e-mail para receber as orientações de redefinição de senha.
          </p>
        </div>

        {submitted ? (
          <div className="text-center p-6 bg-[#F7F9FD] dark:bg-slate-900/60 border border-[#D9E3FC] dark:border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-[#356AE6] dark:text-[#60A5FA] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#17191D] dark:text-white mb-1">Verifique seu e-mail</p>
            <p className="text-xs text-[#777D87] dark:text-slate-400 leading-relaxed mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="E-mail cadastrado"
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <PrimaryButton
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              Enviar Instruções
            </PrimaryButton>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#777D87] dark:text-slate-400 hover:text-[#17191D] dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retornar ao login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
