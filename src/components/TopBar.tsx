import React from 'react';
import { Presentation } from 'lucide-react';

export type ActiveTab = 'report' | 'audit' | 'roi' | 'advisor' | 'studio';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickExport: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'report', label: 'Laudo' },
  { id: 'audit', label: 'Auditoria' },
  { id: 'roi', label: 'Simulador ROI' },
  { id: 'advisor', label: 'Consultor IA' },
  { id: 'studio', label: 'Estúdio & Slides' },
];

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onSelectTab, onQuickExport }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('report')}
          className="font-serif text-lg font-semibold tracking-tight text-[#0F2744] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F2744]"
        >
          ALL-IN Valuation
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2744] ${
                  isActive
                    ? 'text-[#0F2744]'
                    : 'text-slate-600 hover:text-[#0F2744]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0F2744]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0F2744] hover:bg-[#18365A] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2744]"
          >
            <Presentation className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Exportar Slides</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Navegação móvel"
        className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto bg-white"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-1.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#0F2744] text-[#0F2744]'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
