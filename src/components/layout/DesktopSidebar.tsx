import React from 'react';
import { NavLink, useNavigate } from '@/lib/router-shim';
import { motion } from 'motion/react';
import { DeluxLogo } from '../common/DeluxLogo';
import { AssistantOrb } from '../assistant/AssistantOrb';
import { ThemeToggle } from '../common/ThemeToggle';
import { 
  Home, 
  Target, 
  CalendarDays, 
  Sparkles, 
  User, 
  Plus, 
  Crown, 
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Route
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playSelectSound } from '../../services/sound';

export const DesktopSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/app/inicio', label: 'Início', icon: Home },
    { to: '/app/objetivos', label: 'Mapas & Metas', icon: Route },
    { to: '/app/planejamento', label: 'Planejamento', icon: CalendarDays },
    { to: '/app/assistente', label: 'Assistente Delux', icon: Sparkles, badge: 'IA' },
    { to: '/app/perfil', label: 'Perfil & Rotina', icon: User }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-white dark:bg-[#0F141E] border-r border-[#E8EAF0] dark:border-slate-800/80 p-5 shrink-0 select-none overflow-y-auto transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 mb-2 border-b border-[#F2F4F8] dark:border-slate-800/80">
        <NavLink to="/app/inicio" className="cursor-pointer">
          <DeluxLogo size="md" />
        </NavLink>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7033FF]/15 via-[#4E56FF]/15 to-[#2563EB]/15 text-[#4E56FF] dark:text-[#889BFF] border border-[#4E56FF]/25">
            PRO
          </span>
          <ThemeToggle variant="icon" size="sm" />
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mb-6">
        <motion.button
          onClick={() => navigate('/app/objetivos/novo')}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="w-full h-11 px-4 bg-gradient-to-r from-[#7033FF] via-[#4E56FF] to-[#2563EB] hover:from-[#6228F0] hover:via-[#424BF0] hover:to-[#1D54D8] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4E56FF]/25 hover:shadow-lg hover:shadow-[#4E56FF]/35"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Objetivo</span>
        </motion.button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isAssistant = item.to === '/app/assistente';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => playSelectSound()}
              className={({ isActive }: { isActive: boolean }) => {
                if (isAssistant) {
                  return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7033FF]/15 via-[#4E56FF]/15 to-[#2563EB]/15 dark:from-[#7033FF]/25 dark:to-[#2563EB]/25 border border-[#4E56FF]/30 text-[#4E56FF] dark:text-[#9A84FF] font-bold shadow-xs'
                      : 'text-[#475569] dark:text-slate-300 hover:bg-[#F3F5FA] dark:hover:bg-slate-800/60 hover:text-[#17191D] dark:hover:text-white font-medium'
                  }`;
                }
                return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EAF0FF] dark:bg-[#1E293B] text-[#356AE6] dark:text-[#60A5FA] font-semibold'
                    : 'text-[#5A606C] dark:text-slate-400 hover:bg-[#F7F8FA] dark:hover:bg-slate-800/60 hover:text-[#17191D] dark:hover:text-white'
                }`;
              }}
            >
              <div className="flex items-center gap-3">
                {isAssistant ? (
                  <AssistantOrb size="xs" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isAssistant
                      ? 'bg-gradient-to-r from-[#7033FF] to-[#2563EB] text-white shadow-xs'
                      : 'bg-[#356AE6] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Quick Switch in Sidebar */}
      <div className="mb-4 pt-3 border-t border-[#F2F4F8] dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tema do App</span>
        <ThemeToggle variant="segmented" />
      </div>

      {/* User profile capsule */}
      <div className="pt-3 border-t border-[#F2F4F8] dark:border-slate-800/80 flex items-center justify-between">
        <div 
          onClick={() => navigate('/app/perfil')}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-[#17191D] dark:bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user?.full_name?.trim() ? (
              user.full_name.trim().charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#17191D] dark:text-white truncate leading-tight">
              {user?.full_name?.trim() || 'Minha Conta'}
            </p>
            <p className="text-[11px] text-[#777D87] dark:text-slate-400 truncate">
              {user?.email || 'conta@delux.app'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Sair da conta"
          className="p-2 text-[#777D87] dark:text-slate-400 hover:text-[#D94A4A] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
