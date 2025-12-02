
import React, { useEffect, useState } from 'react';
import { AnalysisResult, TrendInsight, StrategyOption, AgentConfig } from '../types';
import { generateStrategies } from '../services/geminiService';
import { Lightbulb, Target, ShieldCheck, ArrowRight, RefreshCw, ChevronLeft, Award } from 'lucide-react';

interface Props {
  analysisData: AnalysisResult;
  trendData: TrendInsight[];
  onNext: (strategy: StrategyOption) => void;
  onBack: () => void;
  agentConfig: AgentConfig | undefined;
  qaAgentConfig: AgentConfig | undefined;
  apiKey?: string;
  globalModel?: string;
}

export const StrategyPlanning: React.FC<Props> = ({ analysisData, trendData, onNext, onBack, agentConfig, qaAgentConfig, apiKey, globalModel }) => {
  const [strategies, setStrategies] = useState<StrategyOption[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrategies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStrategies = async () => {
    // Generate strategies with embedded QA scores
    const results = await generateStrategies(analysisData, trendData, agentConfig?.systemPrompt, apiKey, agentConfig?.model, globalModel);
    setStrategies(results);
    setLoading(false);
  };

  const handleRematch = async () => {
    setLoading(true);
    await loadStrategies();
  };

  const handleNext = () => {
      const selected = strategies.find(s => s.id === selectedStrategyId);
      if (selected) {
          onNext(selected);
      }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lightbulb size={24} className="text-amber-600" />
          </div>
        </div>
        <div className="text-center space-y-2">
           <h3 className="text-lg font-semibold text-slate-800">제안 전략 수립 중...</h3>
           <p className="text-slate-500">
             <span className="font-semibold text-amber-600">{agentConfig?.name || '전략 기획 에이전트'}</span>가 3가지 제안 방향을 설계하고,<br/>
             <span className="font-semibold text-teal-600">{qaAgentConfig?.name || '제안 품질 심사위원'}</span>이 적합성을 평가합니다.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-amber-50">
          <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
            <Target size={20} />
            제안 전략 옵션 (Strategic Options)
          </h3>
          <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-1 rounded">By {agentConfig?.name}</span>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
                <div 
                    key={strategy.id} 
                    onClick={() => setSelectedStrategyId(strategy.id)}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all relative flex flex-col h-full
                        ${selectedStrategyId === strategy.id 
                            ? 'border-blue-600 bg-blue-50/30 shadow-lg ring-2 ring-blue-100' 
                            : 'border-slate-200 hover:border-amber-400 hover:shadow-md bg-white'}`}
                >
                    {/* Badge for high score */}
                    {strategy.qaScore >= 90 && (
                        <div className="absolute -top-3 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Award size={10} /> 추천
                        </div>
                    )}

                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                             {strategy.keywords.map((kw, i) => (
                                 <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                     #{kw}
                                 </span>
                             ))}
                        </div>
                        <h4 className="font-bold text-lg text-slate-900 leading-tight">{strategy.title}</h4>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed flex-grow">
                        {strategy.description}
                    </p>

                    <div className="space-y-3 mt-auto">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <h5 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                <Lightbulb size={12} /> 전략적 포인트
                             </h5>
                             <p className="text-xs text-slate-700">{strategy.rationale}</p>
                        </div>

                        {/* QA Evaluation Section */}
                        <div className={`p-3 rounded-lg border flex flex-col gap-2 ${selectedStrategyId === strategy.id ? 'bg-white border-blue-100' : 'bg-teal-50/50 border-teal-100'}`}>
                             <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-1">
                                 <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                                     <ShieldCheck size={12} /> QA 심사 점수
                                 </span>
                                 <span className={`text-sm font-bold ${strategy.qaScore >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                                     {strategy.qaScore}점
                                 </span>
                             </div>
                             <p className="text-xs text-teal-700 italic">
                                 "{strategy.qaAdvice}"
                             </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className={`text-xs font-semibold ${selectedStrategyId === strategy.id ? 'text-blue-600' : 'text-slate-400'}`}>
                            {selectedStrategyId === strategy.id ? '선택됨' : '선택하려면 클릭'}
                        </span>
                        {selectedStrategyId === strategy.id && <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white"><ArrowRight size={10}/></div>}
                    </div>
                </div>
            ))}
        </div>
      </section>

      <div className="flex justify-between pt-4 items-center">
        <button 
            onClick={onBack}
            className="flex items-center gap-1 px-4 py-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
        >
            <ChevronLeft size={16} /> 이전 단계
        </button>
        <div className="flex gap-3">
            <button 
                onClick={handleRematch}
                className="px-4 py-3 font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors rounded-lg hover:bg-slate-100"
            >
                <RefreshCw size={16} /> 전략 다시 수립
            </button>
            <button 
              onClick={handleNext}
              disabled={!selectedStrategyId}
              className={`px-8 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2
                 ${selectedStrategyId ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              선택한 전략으로 강사 매칭 <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
