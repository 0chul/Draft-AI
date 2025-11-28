import React, { useEffect, useState } from 'react';
import { AnalysisResult, RFPMetadata } from '../types';
import { analyzeRFP } from '../services/geminiService';
import { Edit2, CheckCircle, AlertCircle, Files } from 'lucide-react';

interface Props {
  files: RFPMetadata[];
  onConfirm: (data: AnalysisResult) => void;
}

export const RequirementsReview: React.FC<Props> = ({ files, onConfirm }) => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // For simulation, we assume the first file is the main RFP, or the agent combines them.
      // We pass the name of the first file to the service.
      const mainFile = files[0].fileName;
      const result = await analyzeRFP(mainFile);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [files]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">RFP 분석 에이전트가 {files.length}개의 문서를 분석하고 있습니다...</p>
        <div className="mt-2 text-xs text-slate-400 flex gap-2">
            {files.map((f, i) => (
                <span key={i} className="bg-slate-100 px-2 py-1 rounded">{f.fileName}</span>
            ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>오류가 발생했습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <CheckCircle size={20} className="text-green-400" />
          요구사항 분석 결과
        </h2>
        <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-full">
            <Files size={14} />
            <span>분석된 문서: {files.length}건</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="group relative border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit2 size={14}/></button>
            </div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">제안 프로그램명</label>
            <div className="font-semibold text-lg text-slate-900">{data.programName}</div>
          </div>

          <div className="group relative border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">교육 대상</label>
            <div className="text-slate-800">{data.targetAudience}</div>
          </div>

          <div className="group relative border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">희망 일정</label>
            <div className="text-slate-800">{data.schedule}</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           <div className="group relative border border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors h-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">핵심 교육 목표</label>
            <ul className="space-y-2">
              {data.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="group relative border border-blue-100 bg-blue-50 rounded-lg p-4">
             <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">식별된 모듈 (요구 주제)</label>
             <div className="flex flex-wrap gap-2">
                {data.modules.map((mod, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-blue-200 text-blue-800 rounded-full text-sm font-medium shadow-sm">
                        {mod}
                    </span>
                ))}
             </div>
        </div>
        
        {data.specialRequests && (
            <div className="mt-4 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0"/>
                <span><strong>특이사항:</strong> {data.specialRequests}</span>
            </div>
        )}
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
        <button className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm">수정하기</button>
        <button 
          onClick={() => onConfirm(data)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          확인 및 전략 수립 단계로 이동
        </button>
      </div>
    </div>
  );
};