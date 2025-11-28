
import React, { useState } from 'react';
import { AgentConfig } from '../types';
import { Save, Bot, Shield, Terminal, Cpu, Settings } from 'lucide-react';

interface Props {
  agents: AgentConfig[];
  onSave: (updatedAgents: AgentConfig[]) => void;
  onClose: () => void;
}

export const AgentManagement: React.FC<Props> = ({ agents, onSave, onClose }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0].id);
  const [localAgents, setLocalAgents] = useState<AgentConfig[]>(agents);
  
  const selectedAgent = localAgents.find(a => a.id === selectedAgentId) || localAgents[0];

  const handleUpdate = (field: keyof AgentConfig, value: any) => {
    setLocalAgents(prev => prev.map(agent => 
      agent.id === selectedAgentId ? { ...agent, [field]: value } : agent
    ));
  };

  const handleGuardrailChange = (text: string) => {
    // Split by newline to create array
    const rails = text.split('\n').filter(line => line.trim() !== '');
    handleUpdate('guardrails', rails);
  };

  const handleSaveAll = () => {
    onSave(localAgents);
    // Visual feedback could be added here
    alert('에이전트 설정이 저장되었습니다.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600" />
            AI 에이전트 관리 센터
          </h2>
          <p className="text-slate-500 mt-1">각 프로세스를 담당하는 전문 에이전트의 역할과 행동 지침을 설정합니다.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
                닫기
            </button>
            <button 
                onClick={handleSaveAll}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2"
            >
                <Save size={18} />
                전체 저장
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Sidebar: Agent List */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                에이전트 목록
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {localAgents.map(agent => (
                    <button
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3
                            ${selectedAgent.id === agent.id 
                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border
                            ${selectedAgent.id === agent.id ? 'bg-white text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <Bot size={20} />
                        </div>
                        <div>
                            <div className={`font-semibold text-sm ${selectedAgent.id === agent.id ? 'text-blue-900' : 'text-slate-800'}`}>
                                {agent.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate w-32">
                                {agent.model}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Main Content: Agent Editor */}
        <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedAgent.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">ID: {selectedAgent.id}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <Cpu size={14} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600">Model:</span>
                    <input 
                        type="text" 
                        value={selectedAgent.model}
                        onChange={(e) => handleUpdate('model', e.target.value)}
                        className="text-xs font-mono text-indigo-600 outline-none w-32 bg-transparent"
                    />
                </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Role Definition */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Bot size={16} className="text-blue-500"/>
                        역할 정의 (Role)
                    </label>
                    <textarea
                        value={selectedAgent.role}
                        onChange={(e) => handleUpdate('role', e.target.value)}
                        className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none h-20 bg-slate-50"
                        placeholder="이 에이전트의 주요 역할과 책임을 기술하세요."
                    />
                </div>

                {/* System Prompt */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Terminal size={16} className="text-purple-500"/>
                        시스템 프롬프트 (System Prompt)
                    </label>
                    <div className="relative">
                        <textarea
                            value={selectedAgent.systemPrompt}
                            onChange={(e) => handleUpdate('systemPrompt', e.target.value)}
                            className="w-full p-4 text-sm font-mono text-slate-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all h-64 shadow-inner leading-relaxed"
                            spellCheck={false}
                        />
                        <div className="absolute top-3 right-3 text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded opacity-70">
                            Prompt Editor
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        * 에이전트가 수행해야 할 작업의 구체적인 지시사항과 예시를 입력하세요.
                    </p>
                </div>

                {/* Guardrails */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Shield size={16} className="text-green-500"/>
                        가드레일 (Guardrails)
                    </label>
                    <textarea
                        value={selectedAgent.guardrails.join('\n')}
                        onChange={(e) => handleGuardrailChange(e.target.value)}
                        className="w-full p-3 text-sm border border-red-100 bg-red-50/30 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-all h-32"
                        placeholder="한 줄에 하나씩 제한사항을 입력하세요."
                    />
                     <p className="text-xs text-slate-400 mt-2">
                        * 윤리적 가이드라인, 출력 제한, 금지된 토픽 등을 줄바꿈으로 구분하여 입력하세요.
                    </p>
                </div>

                 {/* Parameters */}
                 <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Settings size={16} className="text-slate-500"/>
                        파라미터 설정
                    </label>
                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg">
                        <div className="flex flex-col w-64">
                            <span className="text-xs font-semibold text-slate-600 mb-1 flex justify-between">
                                Temperature
                                <span>{selectedAgent.temperature}</span>
                            </span>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1"
                                value={selectedAgent.temperature}
                                onChange={(e) => handleUpdate('temperature', parseFloat(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <span className="text-[10px] text-slate-400 mt-1">낮을수록 사실적, 높을수록 창의적</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
