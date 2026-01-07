
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_HISTORY } from '../constants';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold">历史洞察</h2>
      
      <div className="space-y-6">
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">温度趋势</h3>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md">最近 24 小时</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_HISTORY}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#3b82f6' }}
                  labelFormatter={(label) => `时间: ${label}`}
                />
                <Area type="monotone" dataKey="temp" name="温度" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">湿度变化</h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md">最近 24 小时</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_HISTORY}>
                <defs>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                  labelFormatter={(label) => `时间: ${label}`}
                />
                <Area type="monotone" dataKey="humidity" name="湿度" stroke="#10b981" fillOpacity={1} fill="url(#colorHum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">平均温度</p>
            <p className="text-xl font-bold">24.2°C</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">今日能耗</p>
            <p className="text-xl font-bold text-blue-400">12.4 kWh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
