
import React, { useState } from 'react';
import { AgentConfig } from '../types';
import { Save, Bot, Shield, Terminal, Cpu, Settings, Key, Eye, EyeOff, Globe, Signal, AlertTriangle } from 'lucide-react';

interface Props {
  agents: AgentConfig[];
  onSave: (updatedAgents: AgentConfig[]) => void;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const AgentManagement: React.FC<Props> = ({ agents, onSave, onClose, apiKey, onSaveApiKey }) => {
  // 'global' id represents the Global Settings page
  const [selectedId, setSelectedId] = useState<string>('global');
  const [localAgents, setLocalAgents] = useState<AgentConfig[]>(agents);
  const [globalKey, setGlobalKey] = useState(apiKey);
  
  // State for toggling password visibility
  const [showGlobalKey, setShowGlobalKey] = useState(false);
  const [showAgentKey, setShowAgentKey] = useState(false);

  const selectedAgent = localAgents.find(a => a.id === selectedId);

  const handleUpdateAgent = (field: keyof AgentConfig, value: any) => {
    setLocalAgents(prev => prev.map(agent => 
      agent.id === selectedId ? { ...agent, [field]: value } : agent
    ));
  };

  const handleGuardrailChange = (text: string) => {
    const rails = text.split('\n').filter(line => line.trim() !== '');
    handleUpdateAgent('guardrails', rails);
  };

  const handleSaveAll = () => {
    onSave(localAgents);
    onSaveApiKey(globalKey);
    alert('모든 설정이 저장되었습니다.');
  };

  const getStatusColor = (key?: string) => {
    // Logic: If specific key exists, Green. If no specific key but global key exists, Yellow (Inherited). Else Red.
    if (key && key.length > 5) return 'bg-green-500'; 
    if (globalKey && globalKey.length > 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (key?: string) => {
    if (key && key.length > 5) return 'Connected (Custom Key)';
    if (globalKey && globalKey.length > 5) return 'Connected (Global Key)';
    return 'Disconnected';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600" />
            AI 에이전트 관리 센터
          </h2>
          <p className="text-slate-500 mt-1">각 프로세스를 담당하는 전문 에이전트의 역할과 모델 연결을 관리합니다.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
                닫기
            </button>
            <button 
                onClick={handleSaveAll}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
                <Save size={18} />
                전체 저장
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
                <Bot size={18} /> 설정 목록
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {/* Global Settings Item */}
                <button
                    onClick={() => setSelectedId('global')}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3
                        ${selectedId === 'global'
                            ? 'bg-slate-800 border-slate-700 text-white shadow-md' 
                            : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border
                        ${selectedId === 'global' ? 'bg-slate-700 text-blue-400 border-slate-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        <Globe size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-sm">Global Settings</div>
                        <div className={`text-xs truncate w-32 ${selectedId === 'global' ? 'text-slate-400' : 'text-slate-400'}`}>
                            API Key & Defaults
                        </div>
                    </div>
                </button>

                <div className="my-2 border-t border-slate-100 mx-2"></div>

                {/* Agent Items */}
                {localAgents.map(agent => (
                    <button
                        key={agent.id}
                        onClick={() => setSelectedId(agent.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3
                            ${selectedId === agent.id 
                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border relative
                            ${selectedId === agent.id ? 'bg-white text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <Bot size={20} />
                            {/* Small Status Dot in List */}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(agent.apiKey)}`}></div>
                        </div>
                        <div>
                            <div className={`font-semibold text-sm ${selectedId === agent.id ? 'text-blue-900' : 'text-slate-800'}`}>
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

        {/* Right Detail Panel */}
        <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {selectedId === 'global' ? (
                // --- Global Settings View ---
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                         <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Globe className="text-slate-600" />
                            전역 설정 (Global Settings)
                         </h3>
                         <p className="text-sm text-slate-500 mt-1">모든 에이전트에 공통으로 적용되는 기본 설정입니다.</p>
                    </div>
                    <div className="p-8 space-y-8">
                         <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Key size={24} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Master API Key</h4>
                                    <p className="text-slate-400 text-sm">Google Gemini API 호출에 사용될 기본 키입니다.</p>
                                </div>
                             </div>
                             
                             <div className="relative">
                                <input 
                                    type={showGlobalKey ? "text" : "password"}
                                    value={globalKey}
                                    onChange={(e) => setGlobalKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full pl-4 pr-12 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                />
                                <button 
                                    onClick={() => setShowGlobalKey(!showGlobalKey)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showGlobalKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                             </div>
                             <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                 <AlertTriangle size={12} className="text-yellow-500"/>
                                 <span>개별 에이전트에 별도 키가 설정되지 않은 경우 이 키가 사용됩니다.</span>
                             </div>
                         </div>
                    </div>
                </div>
            ) : selectedAgent ? (
                // --- Individual Agent View ---
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedAgent.name}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${getStatusColor(selectedAgent.apiKey)}`}>
                                   {selectedAgent.apiKey ? 'Custom Key' : (globalKey ? 'Global Key' : 'No Key')}
                                </span>
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">ID: {selectedAgent.id}</p>
                        </div>
                        
                        {/* Traffic Light Status Indicator */}
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedAgent.apiKey)} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]`}></div>
                                <span className="text-xs font-bold text-slate-700">
                                    {getStatusText(selectedAgent.apiKey)}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                                Model: <span className="font-mono text-indigo-600">{selectedAgent.model}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {/* Agent-Specific API Key */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <Key size={16} className="text-blue-500"/>
                                개별 API Key 설정 (Optional)
                            </label>
                            <div className="relative">
                                <input 
                                    type={showAgentKey ? "text" : "password"}
                                    value={selectedAgent.apiKey || ''}
                                    onChange={(e) => handleUpdateAgent('apiKey', e.target.value)}
                                    placeholder="이 에이전트 전용 API Key 입력 (비워두면 Global Key 사용)"
                                    className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-white border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                />
                                <button 
                                    onClick={() => setShowAgentKey(!showAgentKey)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showAgentKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                * 특정 모델(예: Pro/Ultra) 사용을 위해 별도 과금이 필요한 경우 설정하세요.
                            </p>
                        </div>

                        {/* Model & Parameters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <Cpu size={16} className="text-indigo-500"/>
                                    파운데이션 모델 (Foundation Model)
                                </label>
                                <input 
                                    type="text" 
                                    value={selectedAgent.model}
                                    onChange={(e) => handleUpdateAgent('model', e.target.value)}
                                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <Settings size={16} className="text-slate-500"/>
                                    창의성 (Temperature: {selectedAgent.temperature})
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1"
                                    value={selectedAgent.temperature}
                                    onChange={(e) => handleUpdateAgent('temperature', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-3"
                                />
                            </div>
                        </div>

                        {/* Role Definition */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <Bot size={16} className="text-blue-500"/>
                                역할 정의 (Role)
                            </label>
                            <textarea
                                value={selectedAgent.role}
                                onChange={(e) => handleUpdateAgent('role', e.target.value)}
                                className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none h-24 bg-white"
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
                                    onChange={(e) => handleUpdateAgent('systemPrompt', e.target.value)}
                                    className="w-full p-4 text-sm font-mono text-slate-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all h-64 shadow-inner leading-relaxed"
                                    spellCheck={false}
                                />
                                <div className="absolute top-3 right-3 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                    Prompt Editor
                                </div>
                            </div>
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
                                className="w-full p-3 text-sm border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all h-32"
                                placeholder="한 줄에 하나씩 제한사항을 입력하세요."
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    에이전트를 선택하세요.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
