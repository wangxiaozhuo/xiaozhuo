
import React, { useState } from 'react';
import { DeviceState, HomeEnvironment, DeviceType } from '../types';

interface Props {
  devices: DeviceState[];
  env: HomeEnvironment;
  onToggle: (id: string) => void;
  onUpdateAC: (val: number) => void;
  onUpdateLight: (id: string, val: number) => void;
}

const Dashboard: React.FC<Props> = ({ devices, env, onToggle, onUpdateAC, onUpdateLight }) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const lights = devices.filter(d => d.type === DeviceType.LIGHT);
  const doors = devices.filter(d => d.type === DeviceType.DOOR);

  const handleToggle = async (id: string) => {
    setSyncingId(id);
    await onToggle(id);
    setTimeout(() => setSyncingId(null), 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* 核心指标卡片 */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-1000"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Indoor Temp</p>
            <div className="flex items-start">
              <span className="text-5xl font-black tracking-tighter text-white">{env.temperature.toFixed(1)}</span>
              <span className="text-xl font-bold text-blue-500 mt-1 ml-1">°</span>
            </div>
          </div>
          <div className="h-12 w-[1px] bg-white/10 mx-4"></div>
          <div className="space-y-1 text-right">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Humidity</p>
            <div className="flex items-start justify-end">
              <span className="text-5xl font-black tracking-tighter text-white">{env.humidity.toFixed(0)}</span>
              <span className="text-xl font-bold text-emerald-500 mt-1 ml-1">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 设备列表 */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Lighting Systems</h2>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {lights.map(light => (
            <div key={light.id} className={`bg-slate-900 rounded-[2rem] p-6 border transition-all duration-500 ${light.isOn ? 'border-amber-500/30' : 'border-white/5'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${light.isOn ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                    <i className={`fa-solid ${light.isOn ? 'fa-lightbulb' : 'fa-lightbulb-slash'} text-xl`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-100">{light.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{light.isOn ? 'Active now' : 'Standby'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle(light.id)}
                  disabled={syncingId === light.id}
                  className={`w-14 h-7 rounded-full transition-all relative ${light.isOn ? 'bg-amber-400 shadow-inner' : 'bg-slate-800 border border-white/5'}`}
                >
                  <div className={`absolute top-1.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${light.isOn ? 'right-1.5 bg-white' : 'left-1.5 bg-slate-600'}`}></div>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intensity Control</span>
                  <span className={`text-xs font-mono font-bold ${light.isOn ? 'text-amber-400' : 'text-slate-700'}`}>
                    {Math.round((light.value || 0) / 2.55)}%
                  </span>
                </div>
                <div className="relative group/slider">
                  <input 
                    type="range" 
                    min="0" 
                    max="255" 
                    disabled={!light.isOn}
                    value={light.isOn ? (light.value || 0) : 0}
                    onChange={(e) => onUpdateLight(light.id, parseInt(e.target.value))}
                    className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all ${
                      light.isOn ? 'bg-slate-800 accent-amber-400' : 'bg-slate-900 opacity-20'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 安全系统 */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 px-1">Security Node</h2>
        <div className="grid grid-cols-2 gap-4">
          {doors.map(door => (
            <button
              key={door.id}
              onClick={() => handleToggle(door.id)}
              className={`p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all active:scale-95 border ${door.isOn ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-600'}`}
            >
              <i className={`fa-solid ${door.isOn ? 'fa-lock' : 'fa-lock-open'} text-xl`}></i>
              <span className="text-[11px] font-black uppercase tracking-widest">{door.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
