import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-shim';
import { api } from '../../services/api';
import { Goal, GoalCategory, GoalStatus } from '../../types';
import { GoalCard, categoryLabels } from '../../components/cards/Cards';
import { PageHeader, EmptyState, LoadingSkeleton } from '../../components/common/CommonComponents';
import { PrimaryButton } from '../../components/common/Buttons';
import { Plus, Search, Filter, Target } from 'lucide-react';

export const GoalsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GoalStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GoalCategory>('all');

  useEffect(() => {
    api.getGoals()
      .then(res => setGoals(res.goals))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredGoals = goals.filter(g => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.desired_outcome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapas & Objetivos"
        subtitle="Seus sonhos e metas transformados em caminhos práticos passo a passo no mínimo detalhe."
        action={
          <PrimaryButton
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/app/objetivos/novo')}
          >
            Mapear Novo Sonho
          </PrimaryButton>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título, categoria ou resultado..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#356AE6] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
          {(['all', 'active', 'paused', 'completed', 'archived'] as const).map(st => {
            const labels = {
              all: 'Todos',
              active: 'Ativos',
              paused: 'Pausados',
              completed: 'Concluídos',
              archived: 'Arquivados'
            };
            const active = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#7033FF] via-[#4E56FF] to-[#2563EB] text-white shadow-sm shadow-[#4E56FF]/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Goals */}
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-6 h-6" />}
          title="Nenhum objetivo encontrado"
          description={
            searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
              : 'Você ainda não cadastrou nenhum objetivo. Transforme seu primeiro projeto pessoal em realidade!'
          }
          action={
            <PrimaryButton
              size="sm"
              onClick={() => navigate('/app/objetivos/novo')}
              icon={<Plus className="w-4 h-4" />}
            >
              Criar Objetivo Agora
            </PrimaryButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={id => navigate(`/app/objetivos/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
