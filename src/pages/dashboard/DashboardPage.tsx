import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-shim';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Goal, Mission, ActivityEvent } from '../../types';
import { TaskRow } from '../../components/cards/Cards';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { SectionHeader, EmptyState, LoadingSkeleton } from '../../components/common/CommonComponents';
import { ProgressBar, ProgressRing } from '../../components/common/ProgressBar';
import { AssistantOrb } from '../../components/assistant/AssistantOrb';
import { 
  Play, 
  Sparkles, 
  Plus, 
  CalendarDays, 
  Target, 
  ArrowRight, 
  Clock, 
  Flame, 
  TrendingUp, 
  CheckCircle2,
  Route,
  Compass,
  MapPin,
  Milestone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playButtonSound } from '../../services/sound';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activityMetrics, setActivityMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, missionsRes, actRes] = await Promise.all([
        api.getGoals(),
        api.getMissions({ date: todayStr }),
        api.getActivity()
      ]);
      setGoals(goalsRes.goals);
      setMissions(missionsRes.missions);
      setActivityMetrics(actRes.metrics);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleMission = async (id: string) => {
    try {
      const res = await api.toggleMission(id);
      if (res.mission.status === 'completed') {
        playSuccessSound();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } else {
        playButtonSound();
      }
      setMissions(prev => prev.map(m => (m.id === id ? res.mission : m)));
      const actRes = await api.getActivity();
      setActivityMetrics(actRes.metrics);
    } catch (err) {
      console.error('Error toggling mission:', err);
    }
  };

  // Local greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Formatted date string in Portuguese
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  const hasCustomName = Boolean(user?.full_name && user.full_name.trim());
  const firstName = hasCustomName ? user!.full_name.trim().split(' ')[0] : '';

  // Active goal & next recommended mission
  const activeGoal = goals.find(g => g.status === 'active') || goals[0];
  const pendingTodayMissions = missions.filter(m => m.status === 'pending');
  const completedTodayMissions = missions.filter(m => m.status === 'completed');
  const nextMission = pendingTodayMissions[0] || missions[0];

  const todayProgressPercent =
    missions.length > 0 ? (completedTodayMissions.length / missions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 1. Header with local greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-[#777D87] dark:text-slate-400 uppercase tracking-wider block mb-0.5">
            {formattedDate}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17191D] dark:text-white">
            {firstName ? `${getGreeting()}, ${firstName}` : `${getGreeting()}!`}
          </h1>
          {!hasCustomName && goals.length === 0 && (
            <p className="text-xs text-[#777D87] dark:text-slate-400 mt-0.5">
              Bem-vindo ao Delux. Defina seu primeiro objetivo para iniciar seu plano diário.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/assistente')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F6F8FF] dark:hover:bg-slate-700 border border-[#DCE4F8] dark:border-slate-700 text-xs font-semibold text-[#17191D] dark:text-white hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-all cursor-pointer shadow-xs"
          >
            <AssistantOrb size="xs" />
            <span>Consultar IA</span>
          </button>
        </div>
      </div>

      {/* 2. Main Executive Spotlight: "Seu Próximo Passo" */}
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-6 h-6" />}
          title="Seu primeiro objetivo começa aqui"
          description="Transforme aquilo que você quer alcançar em um plano concreto com etapas e missões."
          action={
            <PrimaryButton
              size="md"
              onClick={() => navigate('/app/objetivos/novo')}
              icon={<Plus className="w-4 h-4" />}
            >
              Criar Meu Primeiro Objetivo
            </PrimaryButton>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#FAF9FF] to-[#EFF4FF] dark:from-[#111622] dark:via-[#131A2B] dark:to-[#0F172A] border border-[#D9DDF8] dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs transition-colors"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7033FF]/12 via-[#4E56FF]/12 to-[#2563EB]/12 dark:from-[#7033FF]/20 dark:to-[#2563EB]/20 text-[#4E56FF] dark:text-[#9A84FF] border border-[#4E56FF]/20 dark:border-[#4E56FF]/40 text-xs font-bold tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#7033FF] to-[#2563EB] animate-pulse" />
              Seu próximo passo
            </span>
            {activeGoal && (
              <span className="text-xs font-medium text-[#777D87] dark:text-slate-400 truncate max-w-[200px]">
                {activeGoal.title}
              </span>
            )}
          </div>

          {nextMission ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#17191D] dark:text-white tracking-tight leading-snug mb-2">
                {nextMission.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A606C] dark:text-slate-300 leading-relaxed line-clamp-2 max-w-2xl mb-5">
                {nextMission.instructions || 'Execute essa missão com foco para avançar na sua meta.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                <PrimaryButton
                  size="md"
                  icon={nextMission.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  onClick={() => handleToggleMission(nextMission.id)}
                  className="w-full sm:w-auto"
                >
                  {nextMission.status === 'completed' ? 'Marcar como Pendente' : 'Concluir esta Missão'}
                </PrimaryButton>

                <div className="flex items-center gap-3 text-xs text-[#777D87] dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {nextMission.estimated_minutes} minutos
                  </span>
                  {nextMission.scheduled_time && (
                    <span className="inline-flex items-center gap-1 font-medium">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {nextMission.scheduled_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center sm:text-left">
              <p className="text-sm font-semibold text-[#17191D] dark:text-white">
                Todas as missões de hoje foram concluídas!
              </p>
              <p className="text-xs text-[#777D87] dark:text-slate-400 mt-1 mb-4">
                Excelente consistência. Aproveite o descanso ou planeje o próximo dia.
              </p>
              <SecondaryButton
                size="sm"
                onClick={() => navigate('/app/planejamento')}
              >
                Ver planejamento da semana
              </SecondaryButton>
            </div>
          )}
        </motion.div>
      )}

      {/* 2.5 Mapa do Sonho Ativo */}
      {activeGoal && (
        <div className="bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7033FF]/10 to-[#356AE6]/10 dark:from-[#7033FF]/20 dark:to-[#356AE6]/20 flex items-center justify-center text-[#356AE6] dark:text-[#60A5FA]">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#17191D] dark:text-white">
                  Mapa do Sonho: {activeGoal.title}
                </h3>
                <p className="text-[11px] text-[#777D87] dark:text-slate-400">
                  {activeGoal.steps && activeGoal.steps.length > 0 
                    ? `${activeGoal.steps.filter(s => s.status === 'completed').length} de ${activeGoal.steps.length} estações conquistadas no caminho`
                    : 'Roteiro prático estruturado passo a passo'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/app/objetivos/${activeGoal.id}`)}
              className="text-xs font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Abrir Mapa Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeGoal.steps && activeGoal.steps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {activeGoal.steps.slice(0, 3).map((st, idx) => {
                const isCompleted = st.status === 'completed';
                const isCurrent = !isCompleted && (idx === 0 || activeGoal.steps![idx - 1].status === 'completed');
                return (
                  <div
                    key={st.id}
                    onClick={() => navigate(`/app/objetivos/${activeGoal.id}`)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-[#356AE6] dark:border-[#4E56FF] bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs'
                        : isCompleted
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Estação {idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : isCurrent ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
                          Você está aqui
                        </span>
                      ) : null}
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {st.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Section "Hoje" */}
      <div>
        <SectionHeader
          title="Hoje"
          subtitle={
            missions.length > 0
              ? `${completedTodayMissions.length} de ${missions.length} concluídas`
              : 'Nenhuma tarefa agendada para hoje'
          }
          action={
            <button
              onClick={() => navigate('/app/planejamento')}
              className="text-xs font-semibold text-[#356AE6] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver semana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />

        {missions.length === 0 ? (
          <div className="p-6 bg-white dark:bg-[#111622] border border-[#E8EAF0] dark:border-slate-800 rounded-2xl text-center transition-colors">
            <p className="text-xs font-medium text-[#777D87] dark:text-slate-400 mb-3">
              Não há tarefas pendentes para hoje.
            </p>
            <SecondaryButton
              size="sm"
              onClick={() => navigate(goals.length > 0 ? `/app/objetivos/${goals[0].id}` : '/app/objetivos/novo')}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Agendar Missão
            </SecondaryButton>
          </div>
        ) : (
          <div className="space-y-2.5">
            {missions.map(m => {
              const relatedGoal = goals.find(g => g.id === m.goal_id);
              return (
                <TaskRow
                  key={m.id}
                  mission={m}
                  goalTitle={relatedGoal?.title}
                  onToggle={handleToggleMission}
                  onClick={() => relatedGoal && navigate(`/app/objetivos/${relatedGoal.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Section "Evolução & Métricas" */}
      <div>
        <SectionHeader
          title="Evolução"
          subtitle="Seu progresso real calculado a partir da execução"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Conclusão Geral */}
          <div className="bg-white dark:bg-[#111622] p-4 sm:p-5 rounded-2xl border border-[#E8EAF0] dark:border-slate-800 flex items-center gap-4 shadow-xs transition-colors">
            <ProgressRing
              progress={activityMetrics?.completionRate || 0}
              size={58}
              strokeWidth={5}
              color="#356AE6"
            />
            <div>
              <span className="text-[11px] font-semibold text-[#777D87] dark:text-slate-400 uppercase tracking-wider block">
                Taxa de Conclusão
              </span>
              <p className="text-lg font-bold text-[#17191D] dark:text-white">
                {activityMetrics?.completedMissions || 0}{' '}
                <span className="text-xs font-normal text-[#777D87] dark:text-slate-400">
                  / {activityMetrics?.totalMissions || 0} missões
                </span>
              </p>
            </div>
          </div>

          {/* Card 2: Metas Ativas */}
          <div className="bg-white dark:bg-[#111622] p-4 sm:p-5 rounded-2xl border border-[#E8EAF0] dark:border-slate-800 flex items-center gap-4 shadow-xs transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0FF] dark:bg-blue-950/40 text-[#356AE6] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#777D87] dark:text-slate-400 uppercase tracking-wider block">
                Objetivos Ativos
              </span>
              <p className="text-lg font-bold text-[#17191D] dark:text-white">
                {activityMetrics?.activeGoals || 0}{' '}
                <span className="text-xs font-normal text-[#777D87] dark:text-slate-400">
                  em andamento
                </span>
              </p>
            </div>
          </div>

          {/* Card 3: Consistência Recente */}
          <div className="bg-white dark:bg-[#111622] p-4 sm:p-5 rounded-2xl border border-[#E8EAF0] dark:border-slate-800 flex items-center gap-4 shadow-xs transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#777D87] dark:text-slate-400 uppercase tracking-wider block">
                Dias de Prática
              </span>
              <p className="text-lg font-bold text-[#17191D] dark:text-white">
                {activityMetrics?.daysActiveCount || 0}{' '}
                <span className="text-xs font-normal text-[#777D87] dark:text-slate-400">
                  dias consistentes
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Acesso Rápido */}
      <div>
        <SectionHeader title="Acesso Rápido" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.button
            onClick={() => navigate('/app/objetivos/novo')}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="p-4 bg-white dark:bg-[#111622] hover:bg-[#F9FAFC] dark:hover:bg-slate-800/60 border border-[#E8EAF0] dark:border-slate-800 rounded-2xl text-left cursor-pointer shadow-xs flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#EAF0FF] dark:bg-blue-950/40 text-[#356AE6] dark:text-[#60A5FA]">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17191D] dark:text-white">Novo Objetivo</p>
                <p className="text-[11px] text-[#777D87] dark:text-slate-400">Diagnosticar nova meta</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#CFD4DC] dark:text-slate-600 group-hover:text-[#356AE6] dark:group-hover:text-[#60A5FA] group-hover:translate-x-0.5 transition-all" />
          </motion.button>

          <motion.button
            onClick={() => navigate('/app/planejamento')}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="p-4 bg-white dark:bg-[#111622] hover:bg-[#F9FAFC] dark:hover:bg-slate-800/60 border border-[#E8EAF0] dark:border-slate-800 rounded-2xl text-left cursor-pointer shadow-xs flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F2F4F8] dark:bg-slate-800 text-[#5A606C] dark:text-slate-300">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17191D] dark:text-white">Planejamento</p>
                <p className="text-[11px] text-[#777D87] dark:text-slate-400">Organizar semana</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#CFD4DC] dark:text-slate-600 group-hover:text-[#356AE6] dark:group-hover:text-[#60A5FA] group-hover:translate-x-0.5 transition-all" />
          </motion.button>

          <motion.button
            onClick={() => navigate('/app/assistente')}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="p-4 bg-white dark:bg-[#111622] hover:bg-[#F9FAFC] dark:hover:bg-slate-800/60 border border-[#E8EAF0] dark:border-slate-800 rounded-2xl text-left cursor-pointer shadow-xs flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17191D] dark:text-white">Assistente Delux</p>
                <p className="text-[11px] text-[#777D87] dark:text-slate-400">Refinar plano com IA</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#CFD4DC] dark:text-slate-600 group-hover:text-[#356AE6] dark:group-hover:text-[#60A5FA] group-hover:translate-x-0.5 transition-all" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
