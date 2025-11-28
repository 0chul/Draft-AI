import React, { useEffect, useState } from 'react';
import { AnalysisResult, RFPMetadata } from '../types';
import { analyzeRFP } from '../services/geminiService';
import { Edit2, CheckCircle, AlertCircle, Files, Save, ChevronLeft } from 'lucide-react';

interface Props {
  files: RFPMetadata[];
  onConfirm: (data: AnalysisResult) => void;
  onBack: () => void;
}

export const RequirementsReview: React.FC<Props> = ({ files, onConfirm, onBack }) => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleInputChange = (field: keyof AnalysisResult, value: string) => {
    if (data) {
      setData({ ...data, [field]: value });
    }
  };

  const handleArrayChange = (field: keyof AnalysisResult, value: string) => {
    if (data) {
      const array = value.split('\n').filter(line => line.trim() !== '');
      setData({ ...data, [field]: array });
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

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
          <div className={`group relative border rounded-lg p-4 transition-colors ${isEditing ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">제안 프로그램명</label>
            {isEditing ? (
              <input 
                type="text" 
                value={data.programName} 
                onChange={(e) => handleInputChange('programName', e.target.value)}
                className="w-full p-2 border border-blue-200 rounded font-semibold text-lg text-slate-900 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="font-semibold text-lg text-slate-900">{data.programName}</div>
            )}
          </div>

          <div className={`group relative border rounded-lg p-4 transition-colors ${isEditing ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">교육 대상</label>
            {isEditing ? (
              <input 
                type="text" 
                value={data.targetAudience} 
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="w-full p-2 border border-blue-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="text-slate-800">{data.targetAudience}</div>
            )}
          </div>

          <div className={`group relative border rounded-lg p-4 transition-colors ${isEditing ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">희망 일정</label>
             {isEditing ? (
              <input 
                type="text" 
                value={data.schedule} 
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                className="w-full p-2 border border-blue-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="text-slate-800">{data.schedule}</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           <div className={`group relative border rounded-lg p-4 transition-colors h-full ${isEditing ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">핵심 교육 목표</label>
            {isEditing ? (
              <textarea 
                value={data.objectives.join('\n')}
                onChange={(e) => handleArrayChange('objectives', e.target.value)}
                className="w-full h-40 p-2 border border-blue-200 rounded text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                placeholder="각 목표를 줄바꿈으로 구분하세요."
              />
            ) : (
              <ul className="space-y-2">
                {data.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    {obj}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className={`group relative border rounded-lg p-4 ${isEditing ? 'border-blue-400 bg-blue-50/20' : 'border-blue-100 bg-blue-50'}`}>
             <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">식별된 모듈 (요구 주제)</label>
             {isEditing ? (
                 <>
                  <textarea 
                    value={data.modules.join('\n')}
                    onChange={(e) => handleArrayChange('modules', e.target.value)}
                    className="w-full p-2 border border-blue-200 rounded text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                    rows={4}
                    placeholder="각 모듈 주제를 줄바꿈으로 구분하세요."
                  />
                  <p className="text-[10px] text-blue-500 mt-1">* 줄바꿈으로 주제를 구분합니다.</p>
                 </>
             ) : (
                 <div className="flex flex-wrap gap-2">
                    {data.modules.map((mod, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-blue-200 text-blue-800 rounded-full text-sm font-medium shadow-sm">
                            {mod}
                        </span>
                    ))}
                 </div>
             )}
        </div>
        
        {/* Special Requests */}
        <div className={`mt-4 p-3 rounded-md border ${isEditing ? 'border-blue-400 bg-blue-50/20' : 'border-amber-200 bg-amber-50'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                 <AlertCircle size={12} /> 특이사항
            </label>
             {isEditing ? (
                <textarea 
                  value={data.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  rows={2}
                />
             ) : (
                 <div className="text-sm text-amber-900">
                    {data.specialRequests || "특이사항 없음"}
                 </div>
             )}
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
        <button 
            onClick={onBack}
            className="flex items-center gap-1 px-4 py-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
        >
            <ChevronLeft size={16} /> 이전 단계
        </button>
        
        <div className="flex gap-3">
            <button 
                onClick={toggleEdit}
                className={`px-4 py-2 font-medium text-sm flex items-center gap-2 rounded transition-colors
                    ${isEditing 
                        ? 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50' 
                        : 'text-slate-600 hover:text-slate-900'}`}
            >
                {isEditing ? <><CheckCircle size={14}/> 편집 완료</> : <><Edit2 size={14}/> 수정하기</>}
            </button>
            <button 
            onClick={() => onConfirm(data)}
            disabled={isEditing}
            className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2
                ${isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
            확인 및 전략 수립
            </button>
        </div>
      </div>
    </div>
  );
};