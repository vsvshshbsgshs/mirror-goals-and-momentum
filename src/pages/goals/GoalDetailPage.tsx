import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@/lib/router-shim';
import { api } from '../../services/api';
import { Goal, GoalStep, Mission, ActivityEvent } from '../../types';
import { PageHeader, LoadingSkeleton, ConfirmationDialog } from '../../components/common/CommonComponents';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { ProgressBar } from '../../components/common/ProgressBar';
import { TaskRow, categoryIcons, categoryLabels } from '../../components/cards/Cards';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Archive, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  Layers, 
  History, 
  Target, 
  CheckSquare, 
  Sparkles, 
  Edit2,
  Check,
  Route,
  Compass,
  Milestone,
  MapPin,
  Flag,
  Lock,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playSelectSound, playButtonSound } from '../../services/sound';

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'overview' | 'diagnostic' | 'plan' | 'missions' | 'progress' | 'history'>('map');
  
  // Modals & Dialogs
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);

  // New step form
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepCriteria, setNewStepCriteria] = useState('');

  // New mission form
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionInst, setNewMissionInst] = useState('');
  const [newMissionMinutes, setNewMissionMinutes] = useState(30);
  const [newMissionDate, setNewMissionDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchGoal = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.getGoal(id);
      setGoal(res.goal);
    } catch (err) {
      console.error(err);
      navigate('/app/objetivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [id]);

  if (loading || !goal) {
    return <LoadingSkeleton rows={4} />;
  }

  const missions = goal.missions || [];
  const steps = goal.steps || [];
  const diagnostic = goal.diagnostic;

  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const progressPercent = missions.length > 0 ? (completedMissions / missions.length) * 100 : 0;

  // Goal status actions
  const handleUpdateStatus = async (newStatus: any) => {
    try {
      const res = await api.updateGoal(goal.id, { status: newStatus });
      setGoal(prev => (prev ? { ...prev, status: newStatus } : null));
      if (newStatus === 'completed') {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await api.deleteGoal(goal.id);
      navigate('/app/objetivos');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMission = async (missionId: string) => {
    try {
      await api.toggleMission(missionId);
      await fetchGoal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    try {
      await api.createGoalStep(goal.id, {
        title: newStepTitle.trim(),
        description: newStepDesc.trim(),
        success_criteria: newStepCriteria.trim()
      });
      setNewStepTitle('');
      setNewStepDesc('');
      setNewStepCriteria('');
      setShowAddStepModal(false);
      await fetchGoal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim()) return;
    try {
      await api.createMission({
        goal_id: goal.id,
        title: newMissionTitle.trim(),
        instructions: newMissionInst.trim(),
        estimated_minutes: newMissionMinutes,
        scheduled_date: newMissionDate
      });
      setNewMissionTitle('');
      setNewMissionInst('');
      setShowAddMissionModal(false);
      await fetchGoal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStepStatus = async (step: GoalStep) => {
    const nextStatus = step.status === 'completed' ? 'pending' : 'completed';
    try {
      if (nextStatus === 'completed') {
        playSuccessSound();
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        playButtonSound();
      }
      await api.updateGoalStep(step.id, { status: nextStatus });
      await fetchGoal();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { key: 'map', label: '🗺️ Mapa do Caminho' },
    { key: 'overview', label: 'Visão Geral' },
    { key: 'diagnostic', label: 'Diagnóstico' },
    { key: 'plan', label: 'Etapas' },
    { key: 'missions', label: `Missões (${missions.length})` },
    { key: 'progress', label: 'Progresso' },
    { key: 'history', label: 'Histórico' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={goal.title}
        subtitle={`${categoryLabels[goal.category]} • ${goal.priority === 'high' ? 'Alta Prioridade' : 'Prioridade Normal'}`}
        backAction={() => navigate('/app/objetivos')}
        action={
          <div className="flex items-center gap-2">
            {goal.status === 'active' ? (
              <SecondaryButton size="sm" onClick={() => handleUpdateStatus('paused')} icon={<Pause className="w-3.5 h-3.5" />}>
                Pausar
              </SecondaryButton>
            ) : (
              <SecondaryButton size="sm" onClick={() => handleUpdateStatus('active')} icon={<Play className="w-3.5 h-3.5" />}>
                Ativar
              </SecondaryButton>
            )}

            {goal.status !== 'completed' && (
              <PrimaryButton size="sm" onClick={() => handleUpdateStatus('completed')} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Concluir
              </PrimaryButton>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              aria-label="Excluir objetivo"
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#7033FF] via-[#4E56FF] to-[#2563EB] text-white shadow-sm shadow-[#4E56FF]/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: MAPA DO CAMINHO (ROADMAP DO SONHO) */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          {/* Mission & Roadmap Hero HUD */}
          <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#7033FF]/20 via-[#356AE6]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                  <Route className="w-3.5 h-3.5" />
                  <span>Mapa Prático Passo a Passo</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Roteiro de Conquista do Seu Objetivo
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Não é uma lista aleatória: seu objetivo foi desconstruído em estações sequenciais no mínimo detalhe. Cumpra uma estação por vez para alcançar o resultado garantido.
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-white/10">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Progresso do Mapa</span>
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-white">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <SecondaryButton 
                  size="sm" 
                  onClick={() => setShowAddStepModal(true)} 
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                >
                  Adicionar Estação
                </SecondaryButton>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Estações Totais</span>
                <span className="text-base sm:text-lg font-bold text-white">{steps.length}</span>
              </div>
              <div className="bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Concluídas</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400">
                  {steps.filter(s => s.status === 'completed').length}
                </span>
              </div>
              <div className="bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                <span className="text-[11px] text-slate-400 block font-medium">Missões Ativas</span>
                <span className="text-base sm:text-lg font-bold text-blue-300">
                  {completedMissions}/{missions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Roadmap Route Stations */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#7033FF] before:via-[#356AE6] before:to-slate-300 dark:before:to-slate-800">
            {steps.length === 0 ? (
              <div className="bg-white dark:bg-[#111622] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Nenhuma estação definida</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Adicione estações para montar o mapa passo a passo do seu objetivo.</p>
                <PrimaryButton size="sm" onClick={() => setShowAddStepModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
                  Criar 1ª Estação do Mapa
                </PrimaryButton>
              </div>
            ) : (
              steps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = !isCompleted && (idx === 0 || steps[idx - 1].status === 'completed');
                const stepMissions = missions.filter(m => m.goal_step_id === step.id);

                return (
                  <div key={step.id} className="relative group">
                    {/* Glowing GPS Node Indicator on the line */}
                    <button
                      type="button"
                      onClick={() => handleToggleStepStatus(step)}
                      title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                      className={`absolute -left-6 sm:-left-8 top-5 w-6 sm:w-7 h-6 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-gradient-to-r from-[#7033FF] to-[#356AE6] border-white text-white shadow-lg shadow-[#356AE6]/40 ring-4 ring-[#356AE6]/20 animate-pulse'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
                      ) : isCurrent ? (
                        <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </button>

                    {/* Station Content Card */}
                    <div
                      className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                        isCurrent
                          ? 'border-[#356AE6] dark:border-[#4E56FF] bg-white dark:bg-[#111622] shadow-md ring-1 ring-[#356AE6]/20'
                          : isCompleted
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Estação {idx + 1}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                Você está aqui • Foco Atual
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Conquistada ✓
                              </span>
                            )}
                          </div>

                          <h3 className={`text-base sm:text-lg font-bold ${
                            isCompleted ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                          }`}>
                            {step.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleStepStatus(step)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer self-start sm:self-auto ${
                            isCompleted
                              ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-xs'
                          }`}
                        >
                          {isCompleted ? 'Reabrir Estação' : 'Marcar Estação Concluída'}
                        </button>
                      </div>

                      {/* No Mínimo Detalhe: Passo a Passo & Critério */}
                      <div className="space-y-3 pt-2 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            🎯 O Que Executar Nesta Estação:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.description || 'Instruções práticas em execução.'}
                          </p>
                        </div>

                        {step.success_criteria && (
                          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                            <span className="text-[11px] font-bold block mb-0.5">
                              🏁 Critério de Sucesso Tangível:
                            </span>
                            <p className="leading-relaxed">
                              {step.success_criteria}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Associated Missions in this Step */}
                      {stepMissions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                            Missões Práticas Desta Estação ({stepMissions.length}):
                          </span>
                          {stepMissions.map(sm => (
                            <div
                              key={sm.id}
                              onClick={() => handleToggleMission(sm.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                sm.status === 'completed'
                                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#356AE6]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  sm.status === 'completed'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                  {sm.status === 'completed' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </span>
                                <span className="font-medium">{sm.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{sm.estimated_minutes}m</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#111622] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Resultado Esperado</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {goal.desired_outcome || 'Nenhum resultado formal registrado.'}
            </p>

            {goal.description && (
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Descrição</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{goal.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Status:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{goal.status}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Prazo Final:</span>
                <span className="font-bold text-slate-900 dark:text-white">{goal.target_date || 'Flexível'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Etapas:</span>
                <span className="font-bold text-slate-900 dark:text-white">{steps.length} definidas</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Missões:</span>
                <span className="font-bold text-slate-900 dark:text-white">{completedMissions}/{missions.length} concluídas</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111622] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Progresso Operacional</span>
              <span className="text-sm font-bold text-[#356AE6] dark:text-[#60A5FA]">{Math.round(progressPercent)}%</span>
            </div>
            <ProgressBar progress={progressPercent} height="md" />
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNÓSTICO */}
      {activeTab === 'diagnostic' && (
        <div className="bg-white dark:bg-[#111622] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs text-left transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Diagnóstico da Meta</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Análise de ponto de partida, bloqueios e recursos feita na criação do objetivo.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Situação Inicial Informada</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {diagnostic?.current_situation || goal.current_state || 'Não especificada.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">Obstáculos e Atritos Conhecidos</span>
              {diagnostic?.obstacles && diagnostic.obstacles.length > 0 ? (
                <ul className="space-y-1.5">
                  {diagnostic.obstacles.map((obs, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum obstáculo crítico reportado.</p>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">Recursos Disponíveis</span>
              {diagnostic?.available_resources && diagnostic.available_resources.length > 0 ? (
                <ul className="space-y-1.5">
                  {diagnostic.available_resources.map((res, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Tempo diário e foco.</p>
              )}
            </div>

            {diagnostic?.constraints && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Restrições</span>
                <p className="text-xs text-slate-600 dark:text-slate-300">{diagnostic.constraints}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PLANO DE AÇÃO (ETAPAS) */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Etapas do Plano</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Marcos progressivos para quebrar o objetivo.</p>
            </div>
            <SecondaryButton size="sm" onClick={() => setShowAddStepModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
              Adicionar Etapa
            </SecondaryButton>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              return (
                <div
                  key={step.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'border-emerald-300/40 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStepStatus(step)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-[#356AE6] bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Etapa {idx + 1}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA]'
                          }`}>
                            {isCompleted ? 'Concluída' : 'Em Andamento'}
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold mt-0.5 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{step.description}</p>
                        {step.success_criteria && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                            Critério: {step.success_criteria}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MISSÕES */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Missões Associadas</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ações práticas para o dia a dia.</p>
            </div>
            <PrimaryButton size="sm" onClick={() => setShowAddMissionModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
              Nova Missão
            </PrimaryButton>
          </div>

          {missions.length === 0 ? (
            <div className="p-8 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
              <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Nenhuma missão cadastrada ainda</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Adicione micro-tarefas para começar a avançar hoje.</p>
              <PrimaryButton size="sm" onClick={() => setShowAddMissionModal(true)}>
                Criar Primeira Missão
              </PrimaryButton>
            </div>
          ) : (
            <div className="space-y-2.5">
              {missions.map(m => (
                <TaskRow
                  key={m.id}
                  mission={m}
                  onToggle={handleToggleMission}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROGRESSO */}
      {activeTab === 'progress' && (
        <div className="bg-white dark:bg-[#111622] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Análise de Progresso</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Diferenciação clara entre progresso de tarefas e realização prática.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Execução de Missões</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedMissions} <span className="text-xs text-slate-500 dark:text-slate-400">de {missions.length} concluídas</span>
              </p>
              <ProgressBar progress={progressPercent} height="sm" className="mt-3" />
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Etapas Superadas</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {steps.filter(s => s.status === 'completed').length}{' '}
                <span className="text-xs text-slate-500 dark:text-slate-400">de {steps.length} etapas</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HISTÓRICO */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#111622] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs transition-colors">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Histórico de Atividades</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Linha do tempo de marcos deste objetivo.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-[#356AE6] mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Objetivo criado</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date(goal.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {goal.completed_at && (
              <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">Objetivo concluído</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date(goal.completed_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVA ETAPA */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111622] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-left transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Nova Etapa do Plano</h3>
            <form onSubmit={handleCreateStep} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Título da Etapa</label>
                <input
                  type="text"
                  placeholder="Ex: Treino de Compreensão Auditiva Rápida"
                  value={newStepTitle}
                  onChange={e => setNewStepTitle(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#356AE6]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Instruções para passar de fase..."
                  value={newStepDesc}
                  onChange={e => setNewStepDesc(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm resize-none focus:outline-none focus:border-[#356AE6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Critério de Sucesso</label>
                <input
                  type="text"
                  placeholder="Ex: 80% de assertividade nas gravações"
                  value={newStepCriteria}
                  onChange={e => setNewStepCriteria(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#356AE6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <SecondaryButton size="sm" type="button" onClick={() => setShowAddStepModal(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton size="sm" type="submit">
                  Salvar Etapa
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA MISSÃO */}
      {showAddMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111622] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-left transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Nova Missão Prática</h3>
            <form onSubmit={handleCreateMission} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Título da Missão</label>
                <input
                  type="text"
                  placeholder="Ex: Shadowing de 15 minutos com podcast"
                  value={newMissionTitle}
                  onChange={e => setNewMissionTitle(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#356AE6]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Instruções Práticas</label>
                <textarea
                  rows={2}
                  placeholder="O que exatamente deve ser feito no tempo estipulado..."
                  value={newMissionInst}
                  onChange={e => setNewMissionInst(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs sm:text-sm resize-none focus:outline-none focus:border-[#356AE6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Minutos Estimados</label>
                  <input
                    type="number"
                    value={newMissionMinutes}
                    onChange={e => setNewMissionMinutes(parseInt(e.target.value, 10))}
                    className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#356AE6]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">Data Agendada</label>
                  <input
                    type="date"
                    value={newMissionDate}
                    onChange={e => setNewMissionDate(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#356AE6]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <SecondaryButton size="sm" type="button" onClick={() => setShowAddMissionModal(false)}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton size="sm" type="submit">
                  Criar Missão
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteModal}
        title="Excluir Objetivo Definitivamente?"
        description="Esta ação excluirá o diagnóstico, etapas e missões vinculadas. Para manter o histórico sem executá-lo agora, prefira pausar ou arquivar."
        confirmLabel="Sim, excluir"
        isDestructive
        onConfirm={handleDeleteGoal}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
