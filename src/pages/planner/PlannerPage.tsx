import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Goal, Mission, UserPreferences } from '../../types';
import { PageHeader, LoadingSkeleton, ConfirmationDialog } from '../../components/common/CommonComponents';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { TaskRow } from '../../components/cards/Cards';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2,
  CalendarDays,
  MoveRight
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const [plannerData, setPlannerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPlanner = async () => {
    try {
      setLoading(true);
      const res = await api.getPlanner();
      setPlannerData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  const handleToggleMission = async (missionId: string) => {
    try {
      await api.toggleMission(missionId);
      await fetchPlanner();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveMissionDate = async (mission: Mission, daysOffset: number) => {
    try {
      const current = new Date(mission.scheduled_date || new Date().toISOString().split('T')[0]);
      current.setDate(current.getDate() + daysOffset);
      const newDateStr = current.toISOString().split('T')[0];
      await api.updateMission(mission.id, { scheduled_date: newDateStr });
      await fetchPlanner();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmRebalance = async () => {
    setRebalancing(true);
    try {
      const res = await api.rebalancePlanner();
      setShowRebalanceModal(false);
      setToastMessage(res.message);
      await fetchPlanner();
    } catch (err: any) {
      alert(err.message || 'Erro ao redistribuir.');
    } finally {
      setRebalancing(false);
    }
  };

  if (loading || !plannerData) {
    return <LoadingSkeleton rows={4} />;
  }

  const { days, goals, preferences } = plannerData;
  const currentSelectedDay = days[selectedDayIdx] || days[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planejamento Semanal"
        subtitle="Organize suas ações nos próximos 7 dias com base na sua capacidade real de tempo."
        action={
          <SecondaryButton
            size="sm"
            onClick={() => setShowRebalanceModal(true)}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#356AE6]" />}
          >
            Redistribuir Pendências
          </SecondaryButton>
        }
      />

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold underline text-xs cursor-pointer">
            OK
          </button>
        </div>
      )}

      {/* 7-Day Quick Strip Bar */}
      <div className="bg-white dark:bg-[#111622] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
          {days.map((day: any, idx: number) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl flex flex-col items-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7033FF] via-[#4E56FF] to-[#2563EB] text-white shadow-sm shadow-[#4E56FF]/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
                  {day.dayName}
                </span>
                <span className="text-sm font-bold mt-0.5">{day.dayNumber}</span>
                <div className="flex items-center gap-1 mt-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      day.hasConflict
                        ? 'bg-amber-400'
                        : day.missions.length > 0
                        ? isSelected
                          ? 'bg-white'
                          : 'bg-[#356AE6] dark:bg-[#60A5FA]'
                        : 'bg-transparent'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Capacity and Conflict Alert */}
      <div className="bg-white dark:bg-[#111622] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentSelectedDay.isToday ? 'Hoje' : currentSelectedDay.dayName} —{' '}
              {new Date(currentSelectedDay.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long'
              })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Carga total estimada:{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentSelectedDay.totalMinutes} minutos
              </span>{' '}
              (sua meta diária: {currentSelectedDay.availableMinutes} min)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                currentSelectedDay.hasConflict
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
              }`}
            >
              {currentSelectedDay.hasConflict ? 'Carga Alta' : 'Equilibrado'}
            </span>
          </div>
        </div>

        {currentSelectedDay.hasConflict && (
          <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              As atividades deste dia superam seu tempo ideal. Considere mover uma das tarefas para o dia seguinte para evitar frustração.
            </p>
          </div>
        )}

        {/* Missions for current day */}
        <div className="space-y-2.5">
          {currentSelectedDay.missions.length === 0 ? (
            <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Nenhuma missão agendada para este dia</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Aproveite o tempo de descanso ou adiante passos dos seus objetivos ativos.
              </p>
            </div>
          ) : (
            currentSelectedDay.missions.map((m: Mission) => {
              const relatedGoal = goals.find((g: Goal) => g.id === m.goal_id);
              return (
                <div key={m.id} className="relative group">
                  <TaskRow
                    mission={m}
                    goalTitle={relatedGoal?.title}
                    onToggle={handleToggleMission}
                  />
                  {/* Quick Reschedule Pill */}
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleMoveMissionDate(m, 1);
                      }}
                      title="Mover para amanhã"
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#356AE6] dark:hover:text-[#60A5FA] rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Amanhã</span>
                      <MoveRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Planner Rebalance */}
      <ConfirmationDialog
        isOpen={showRebalanceModal}
        title="Redistribuir Missões Automaticamente?"
        description="O Delux reorganizará as tarefas atrasadas e pendentes pelos próximos 3 dias, respeitando seu limite diário e evitando sobrecarga. Nenhuma tarefa será excluída."
        confirmLabel="Sim, redistribuir com equilíbrio"
        onConfirm={handleConfirmRebalance}
        onCancel={() => setShowRebalanceModal(false)}
      />
    </div>
  );
};
