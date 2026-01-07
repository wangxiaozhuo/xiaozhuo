
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { DeviceState, HomeEnvironment, Message, DeviceType } from '../types';

interface Props {
  devices: DeviceState[];
  env: HomeEnvironment;
  onControl: (id: string) => void;
}

const AIChat: React.FC<Props> = ({ devices, env, onControl }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "您好！我是 Lumina。我可以帮您控制家里的设备或提供节能建议。试试直接对我说“打开客厅灯”。" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const controlDeviceFunctionDeclaration: FunctionDeclaration = {
    name: 'controlDevice',
    parameters: {
      type: Type.OBJECT,
      description: 'Control a smart home device (e.g., turn on/off lights or lock/unlock doors).',
      properties: {
        deviceId: {
          type: Type.STRING,
          description: 'The unique ID of the device to control.',
        },
        action: {
          type: Type.STRING,
          description: 'The action to perform: "toggle".',
        },
      },
      required: ['deviceId', 'action'],
    },
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';

      const systemInstruction = `
        你叫 Lumina，是一位极简主义风格的智能家居助手。
        请始终使用简短、专业的中文回复。
        
        当前状态:
        - 环境: ${JSON.stringify(env)}
        - 设备: ${JSON.stringify(devices)}

        回复规范:
        - 操作设备必须调用 controlDevice。
        - 确认操作后，回复应极简（如：“好的，客厅灯已开启。”）。
        - 严禁废话。
      `;

      const response = await ai.models.generateContent({
        model,
        contents: textToSend,
        config: {
          systemInstruction,
          temperature: 0.5,
          tools: [{ functionDeclarations: [controlDeviceFunctionDeclaration] }],
        }
      });

      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'controlDevice') {
            const { deviceId } = fc.args as { deviceId: string };
            onControl(deviceId);
          }
        }
      }

      const aiResponse = response.text || "指令已执行。";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (error) {
      console.error('Gemini error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "连接出现问题，请确认 API Key 已配置。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 简单的语音识别实现 (使用 Web Speech API)
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("您的浏览器不支持语音识别。请在手机 Chrome 或 Safari 中尝试。");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[72vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-sparkles text-white text-xl"></i>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#020617] rounded-full"></div>
        </div>
        <div>
          <h3 className="font-black text-lg tracking-tight">LUMINA INTELLIGENCE</h3>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active Listening Mode</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide mb-4"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900 px-5 py-3.5 rounded-3xl rounded-tl-none border border-white/5 flex gap-1.5">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-900 rounded-2xl border border-white/5 p-1 flex items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="键入指令..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm py-3 text-white placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-30"
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
        
        <button 
          onClick={toggleListening}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isListening 
            ? 'bg-rose-500 text-white animate-pulse' 
            : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          }`}
        >
          <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default AIChat;
