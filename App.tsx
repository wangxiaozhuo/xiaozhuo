
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const init = async () => {
      const success = await iotService.connect((status) => {
        setIotStatus(status);
      });
      
      if (success) {
        const cloudData = await iotService.getCloudStatus();
        if (cloudData) {
          setDevices(prev => prev.map(d => 
            d.id === 'l1' ? { ...d, value: cloudData.dengguang, isOn: cloudData.dengguang > 0 } : d
          ));
        }
      }
    };
    init();
  }, []);

  const toggleDevice = async (id: string, shouldSync = true) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isOn;
        if (shouldSync && id === 'l1') {
          iotService.updateProperty(nextState ? (d.value || 255) : 0);
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
    }
  };

  const updateAC = (val: number) => {
    setDevices(prev => prev.map(d => d.type === DeviceType.AC ? { ...d, value: val } : d));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-white/5">
      {/* 联接状态显示 - 响应真实 MQTT 状态 */}
      <div className={`text-[8px] px-6 py-2 flex flex-col transition-all duration-500 ${
        iotStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-300' : 
        iotStatus === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-300'
      } border-b border-white/5`}>
        <div className="flex justify-between items-center mb-0.5 uppercase tracking-wider font-bold">
          <span className="flex items-center gap-1.5">
            <i className={`fa-solid ${iotStatus === 'connected' ? 'fa-circle-check' : 'fa-circle-notch fa-spin'}`}></i>
            MQTT OVER WSS (PORT 443)
          </span>
          <span className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${iotStatus === 'connected' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-500'}`}></div>
            {iotStatus === 'connected' ? '在线' : iotStatus === 'error' ? '连接失败' : '正在上线...'}
          </span>
        </div>
        <div className="opacity-60 truncate font-mono flex justify-between items-center">
          <span>ID: {IOT_CONFIG.username}</span>
          <span>CN-EAST-3</span>
        </div>
      </div>

      <header className="p-6 pt-4 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lumina</h1>
          <p className="text-slate-400 text-sm">物模型测试：{IOT_CONFIG.serviceId}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center">
          <i className={`fa-solid fa-wifi ${iotStatus === 'connected' ? 'text-emerald-400' : 'text-blue-400'}`}></i>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-24 scroll-smooth">
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

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
