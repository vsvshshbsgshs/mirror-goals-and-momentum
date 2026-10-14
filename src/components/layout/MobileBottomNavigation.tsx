import React from 'react';
import { NavLink, useLocation } from '@/lib/router-shim';
import { Home, Target, CalendarDays, User, Route } from 'lucide-react';
import { AssistantOrb } from '../assistant/AssistantOrb';
import { playSelectSound } from '../../services/sound';

export const MobileBottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/app/inicio', label: 'Início', icon: Home },
    { to: '/app/objetivos', label: 'Mapas', icon: Route },
    { to: '/app/planejamento', label: 'Plano', icon: CalendarDays },
    { to: '/app/assistente', label: 'Assistente', isOrb: true },
    { to: '/app/perfil', label: 'Perfil', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0F141E]/95 backdrop-blur-md border-t border-[#E8EAF0] dark:border-slate-800/80 pb-[env(safe-area-inset-bottom,0px)] transition-colors">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => playSelectSound()}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-150 relative ${
                isActive
                  ? 'text-[#2563EB] dark:text-[#60A5FA] font-semibold'
                  : 'text-[#777D87] dark:text-slate-400 hover:text-[#17191D] dark:hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {item.isOrb ? (
                  <AssistantOrb size="xs" className={isActive ? 'scale-115 transition-transform' : ''} />
                ) : (
                  Icon && <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-gradient-to-r from-[#7033FF] to-[#2563EB] rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
