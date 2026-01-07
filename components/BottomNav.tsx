
import React from 'react';

interface Props {
  activeTab: 'home' | 'stats' | 'ai';
  setActiveTab: (tab: 'home' | 'stats' | 'ai') => void;
}

const BottomNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 glass border-t border-white/5 flex items-center justify-around px-8 z-50">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
      >
        <i className="fa-solid fa-house text-lg"></i>
        <span className="text-[10px] font-bold uppercase">首页</span>
      </button>

      <button 
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
      >
        <i className="fa-solid fa-chart-line text-lg"></i>
        <span className="text-[10px] font-bold uppercase">统计</span>
      </button>

      <button 
        onClick={() => setActiveTab('ai')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'ai' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
      >
        <i className="fa-solid fa-sparkles text-lg"></i>
        <span className="text-[10px] font-bold uppercase">助手</span>
      </button>
    </nav>
  );
};

export default BottomNav;
