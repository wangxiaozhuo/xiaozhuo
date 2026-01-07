
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
    { role: 'assistant', content: "您好！我是 Lumina，您的智能家居助手。今天有什么我可以帮您的吗？" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // FIX: Define a formal FunctionDeclaration for smart home control to replace fragile keyword matching
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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      // FIX: Always create a fresh instance of GoogleGenAI before generating content
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';

      // FIX: Use systemInstruction field for character context and control constraints
      const systemInstruction = `
        你叫 Lumina，是一位世界级的智能家居助手。
        请始终使用中文回复用户。
        
        当前家居状态:
        - 环境: ${JSON.stringify(env)}
        - 设备: ${JSON.stringify(devices)}

        回复指南:
        - 如果用户想控制设备（开关灯、锁门等），请务必使用 controlDevice 函数并传入正确的 deviceId。
        - 根据环境数据提供有关节能或居家舒适度的建议（例如：如果温度高，建议开空调）。
        - 保持语气亲切、简洁。
      `;

      const response = await ai.models.generateContent({
        model,
        contents: userMsg,
        config: {
          systemInstruction,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          tools: [{ functionDeclarations: [controlDeviceFunctionDeclaration] }],
        }
      });

      // FIX: Handle structured function calls from the model
      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'controlDevice') {
            const { deviceId } = fc.args as { deviceId: string };
            onControl(deviceId);
          }
        }
      }

      // FIX: Use .text property to get text content from response
      const aiResponse = response.text || "我已经为您处理了该请求。";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (error) {
      console.error('Gemini error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "连接出现问题，请稍后再试。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center">
          <i className="fa-solid fa-sparkles text-white"></i>
        </div>
        <div>
          <h3 className="font-bold">Lumina 助手</h3>
          <p className="text-xs text-emerald-400 font-medium">在线并随时待命</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'glass text-slate-200'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 glass rounded-2xl p-2 flex items-center gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="问问 Lumina..."
          className="flex-1 bg-transparent border-none outline-none px-3 text-sm py-2"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default AIChat;
