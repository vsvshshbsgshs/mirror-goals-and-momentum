import React from 'react';
import { motion } from 'motion/react';
import { Goal, Mission, GoalCategory, MissionPriority } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { 
  Check, 
  Clock, 
  Calendar, 
  Target, 
  Sparkles, 
  ArrowRight, 
  MoreHorizontal,
  Flame,
  BookOpen,
  Briefcase,
  DollarSign,
  HeartPulse,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playButtonSound } from '../../services/sound';

export const categoryIcons: Record<GoalCategory, React.ReactNode> = {
  health: <HeartPulse className="w-4 h-4 text-emerald-600" />,
  learning: <BookOpen className="w-4 h-4 text-blue-600" />,
  career: <Briefcase className="w-4 h-4 text-indigo-600" />,
  finance: <DollarSign className="w-4 h-4 text-amber-600" />,
  organization: <Target className="w-4 h-4 text-violet-600" />,
  personal_dev: <Flame className="w-4 h-4 text-orange-600" />,
  other: <Compass className="w-4 h-4 text-slate-600" />
};

export const categoryLabels: Record<GoalCategory, string> = {
  health: 'Saúde & Físico',
  learning: 'Aprendizado',
  career: 'Carreira',
  finance: 'Finanças',
  organization: 'Organização',
  personal_dev: 'Desenvolvimento',
  other: 'Outro'
};

interface TaskRowProps {
  mission: Mission;
  goalTitle?: string;
  onToggle: (id: string) => void;
  onClick?: (mission: Mission) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  mission,
  goalTitle,
  onToggle,
  onClick
}) => {
  const isCompleted = mission.status === 'completed';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      playSuccessSound();
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#356AE6', '#248A62', '#84a9ff']
        });
      } catch {
        // ignore
      }
    } else {
      playButtonSound();
    }
    onToggle(mission.id);
  };

  return (
    <motion.div
      onClick={() => onClick && onClick(mission)}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`group flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-[#111622] hover:bg-slate-50/70 dark:hover:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl cursor-pointer shadow-xs transition-colors ${
        isCompleted ? 'opacity-75 bg-slate-50/70 dark:bg-slate-900/40' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Apple-style circular checkbox with spring feedback */}
        <motion.button
          onClick={handleCheckboxClick}
          whileTap={{ scale: 0.8 }}
          animate={{ scale: isCompleted ? [0.85, 1.15, 1] : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          aria-label={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
          className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isCompleted
              ? 'bg-[#10B981] border-[#10B981] text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-[#356AE6] bg-white dark:bg-slate-800 group-hover:scale-105'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </motion.button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-snug transition-all ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
            }`}
          >
            {mission.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {goalTitle && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                {goalTitle}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {mission.estimated_minutes} min
            </span>
            {mission.priority === 'high' && (
              <span className="text-[10px] px-1.5 py-0.5 font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md">
                Alta
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center pl-2 shrink-0">
        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#356AE6] dark:group-hover:text-[#60A5FA] group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.div>
  );
};

interface GoalCardProps {
  goal: Goal;
  onClick: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  const missions = goal.missions || [];
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const progressPercent = missions.length > 0 ? (completedMissions / missions.length) * 100 : 0;
  const activeStep = goal.steps?.find(s => s.status === 'in_progress') || goal.steps?.[0];

  const statusBadges: Record<string, { label: string; class: string }> = {
    active: { label: 'Ativo', class: 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA]' },
    paused: { label: 'Pausado', class: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
    completed: { label: 'Concluído', class: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
    draft: { label: 'Rascunho', class: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
    archived: { label: 'Arquivado', class: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' }
  };

  const badge = statusBadges[goal.status] || statusBadges.active;

  return (
    <motion.div
      onClick={() => onClick(goal.id)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="group bg-white dark:bg-[#111622] hover:bg-slate-50/60 dark:hover:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#356AE6]/40 dark:hover:border-[#356AE6]/50 cursor-pointer shadow-xs hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {categoryIcons[goal.category] || categoryIcons.other}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {categoryLabels[goal.category]}
          </span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#356AE6] dark:group-hover:text-[#60A5FA] transition-colors leading-snug line-clamp-2 mb-2">
        {goal.title}
      </h3>

      {goal.desired_outcome && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {goal.desired_outcome}
        </p>
      )}

      {activeStep && (
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
            Etapa Atual
          </span>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
            {activeStep.title}
          </p>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span>{completedMissions}/{missions.length} missões concluídas</span>
          <span className="font-semibold text-slate-900 dark:text-white">{Math.round(progressPercent)}%</span>
        </div>
        <ProgressBar progress={progressPercent} height="sm" />
      </div>
    </motion.div>
  );
};
