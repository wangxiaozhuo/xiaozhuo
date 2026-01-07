
import React, { useState, useEffect, useRef } from 'react';
import { DeviceState, HomeEnvironment, DeviceType } from './types';
import { INITIAL_DEVICES } from './constants';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AIChat from './components/AIChat';
import BottomNav from './components/BottomNav';
import { iotService, IOT_CONFIG } from './services/iotService';

const App: React.FC = () => {
  const [devices, setDevices] = useState<DeviceState[]>(INITIAL_DEVICES);
  const [env, setEnv] = useState<HomeEnvironment>({
    temperature: 23.5,
    humidity: 48,
    airQuality: '优'
  });
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'ai'>('home');
  const [iotStatus, setIotStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [ `${new Date().toLocaleTimeString()} - ${msg}`, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    const init = async () => {
      addLog("正在初始化 MQTT 堆栈...");
      const success = await iotService.connect((status) => {
        setIotStatus(status);
        addLog(`连接状态变更: ${status.toUpperCase()}`);
      });
      
      if (success) {
        addLog("成功握手华为云 IoTDA 服务器");
      } else {
        addLog("连接失败，请检查 MQTT 凭证");
      }
    };
    init();
  }, []);

  const toggleDevice = async (id: string, shouldSync = true) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isOn;
        if (shouldSync && id === 'l1') {
          const val = nextState ? (d.value || 255) : 0;
          iotService.updateProperty(val);
          addLog(`下发指令: ${d.name} -> ${nextState ? 'ON' : 'OFF'} (${val})`);
        }
        return { ...d, isOn: nextState };
      }
      return d;
    }));
  };

  const updateLightIntensity = async (id: string, val: number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, value: val, isOn: val > 0 } : d));
    if (id === 'l1') {
      await iotService.updateProperty(val);
      if (val % 20 === 0) addLog(`调节亮度: ${val}`);
    }
  };

  const updateAC = (val: number) => {
    setDevices(prev => prev.map(d => d.type === DeviceType.AC ? { ...d, value: val } : d));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-white/5">
      {/* 增强型状态栏 - 适配刘海屏 */}
      <div 
        onClick={() => setShowLogs(!showLogs)}
        className={`cursor-pointer safe-top px-6 py-3 flex flex-col transition-all duration-500 ${
        iotStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-300' : 
        iotStatus === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-300'
      } border-b border-white/5 active:opacity-70 z-[110]`}>
        <div className="flex justify-between items-center uppercase tracking-[0.1em] font-black text-[9px]">
          <span className="flex items-center gap-2">
            <i className={`fa-solid ${iotStatus === 'connected' ? 'fa-bolt-lightning' : 'fa-circle-notch fa-spin'}`}></i>
            SYSTEM {iotStatus}
          </span>
          <span className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${iotStatus === 'connected' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></div>
            {iotStatus === 'connected' ? 'CLOUD SYNC' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* 实时日志弹窗 */}
      {showLogs && (
        <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl p-6 pt-24 overflow-y-auto font-mono text-[10px] leading-relaxed animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
            <h3 className="text-blue-400 font-bold">DEVICE COMM LOGS</h3>
            <button onClick={() => setShowLogs(false)} className="text-slate-500 hover:text-white px-2 py-1 bg-white/5 rounded">CLOSE</button>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="mb-1 py-1 border-b border-white/5 last:border-0">
              <span className="text-slate-600 mr-2">[{i}]</span>
              <span className={log.includes('成功') || log.includes('connected') ? 'text-emerald-400' : 'text-slate-400'}>{log}</span>
            </div>
          ))}
        </div>
      )}

      <header className="p-6 pt-8 flex justify-between items-end z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-slate-600 bg-clip-text text-transparent">LUMINA</h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1 opacity-80">Autonomous Home</p>
        </div>
        <div className="flex flex-col items-end opacity-50">
          <div className="text-[9px] font-mono text-slate-500 tracking-tighter">NODE_{IOT_CONFIG.username.slice(-4)}</div>
          <div className="flex gap-1 mt-1">
             <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
             <div className="w-1 h-1 rounded-full bg-blue-500/30"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 scroll-smooth">
        {activeTab === 'home' && (
          <Dashboard 
            devices={devices} 
            env={env} 
            onToggle={toggleDevice} 
            onUpdateAC={updateAC}
            onUpdateLight={updateLightIntensity}
          />
        )}
        {activeTab === 'stats' && <Analytics />}
        {activeTab === 'ai' && <AIChat devices={devices} env={env} onControl={toggleDevice} />}
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto safe-bottom z-40">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
