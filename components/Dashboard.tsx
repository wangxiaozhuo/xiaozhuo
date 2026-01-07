
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
  const ac = devices.find(d => d.type === DeviceType.AC);

  const handleToggle = async (id: string) => {
    setSyncingId(id);
    await onToggle(id);
    setTimeout(() => setSyncingId(null), 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="glass rounded-3xl p-6 relative overflow-hidden border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-4xl font-light">{env.temperature.toFixed(1)}°</span>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">实时温度</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-4xl font-light">{env.humidity.toFixed(0)}%</span>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">实时湿度</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-mono">
          <i className="fa-solid fa-code-branch text-[8px]"></i>
          华为云 IoTDA 属性同步激活
        </div>
      </section>

      {/* 针对截图优化的灯光控制 */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-amber-400"></i>
            设备控制
          </h2>
          <span className="text-[10px] text-slate-500">服务: light | 属性: dengguang</span>
        </div>
        
        <div className="space-y-4">
          {lights.map(light => (
            <div key={light.id} className="glass rounded-3xl p-5 space-y-4 relative group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${light.isOn ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20' : 'bg-slate-800 text-slate-500'}`}>
                    <i className={`fa-solid ${light.isOn ? 'fa-lightbulb' : 'fa-lightbulb-slash'}`}></i>
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">{light.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <i className="fa-solid fa-circle-info text-[8px]"></i>
                      ID: {light.id === 'l1' ? '69311837...TEST' : 'Local Device'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle(light.id)}
                  disabled={syncingId === light.id}
                  className={`w-12 h-6 rounded-full transition-all relative ${light.isOn ? 'bg-amber-400' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${light.isOn ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              
              <div className="space-y-2 px-2 pb-2">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-400">物模型数值 (dengguang)</span>
                  <span className={`font-mono ${light.isOn ? 'text-amber-400' : 'text-slate-600'}`}>
                    {light.isOn ? (light.value || 0) : 'OFF (0)'}
                  </span>
                </div>
                <div className="relative pt-1">
                  <input 
                    type="range" 
                    min="0" 
                    max="255" 
                    disabled={!light.isOn}
                    value={light.isOn ? (light.value || 0) : 0}
                    onChange={(e) => onUpdateLight(light.id, parseInt(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-opacity ${
                      light.isOn ? 'bg-slate-800 accent-amber-400 opacity-100' : 'bg-slate-900 opacity-30 cursor-not-allowed'
                    }`}
                  />
                  {light.id === 'l1' && (
                    <div className="flex justify-between mt-1 text-[8px] text-slate-600 font-mono">
                      <span>MIN: 0</span>
                      <span>MAX: 255</span>
                    </div>
                  )}
                </div>
              </div>
              
              {syncingId === light.id && (
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] rounded-3xl flex items-center justify-center animate-pulse">
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">云端同步中...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 其他辅助设备 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-blue-400"></i>
          安防系统
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {doors.map(door => (
            <button
              key={door.id}
              onClick={() => handleToggle(door.id)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 ${door.isOn ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20' : 'glass text-slate-500 opacity-60'}`}
            >
              <i className={`fa-solid ${door.isOn ? 'fa-lock' : 'fa-lock-open'} text-lg`}></i>
              <span className="text-[11px] font-bold">{door.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
