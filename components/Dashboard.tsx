
import React from 'react';
import { PastProposal, ProposalDraft, AppStep } from '../types';
import { Plus, FileText, Clock, TrendingUp, MoreHorizontal, ArrowUpRight, Calendar, Search, Filter, PlayCircle, FolderOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  proposals: PastProposal[];
  drafts: ProposalDraft[];
  onNewProposal: () => void;
  onResumeDraft: (draft: ProposalDraft) => void;
  onViewAll: () => void;
}

const STATS_DATA = [
  { name: 'Jan', proposals: 4, value: 2400 },
  { name: 'Feb', proposals: 3, value: 1398 },
  { name: 'Mar', proposals: 8, value: 9800 },
  { name: 'Apr', proposals: 6, value: 3908 },
  { name: 'May', proposals: 9, value: 4800 },
  { name: 'Jun', proposals: 12, value: 6800 },
];

export const Dashboard: React.FC<Props> = ({ proposals, drafts, onNewProposal, onResumeDraft, onViewAll }) => {
  // Calculate stats
  const totalProposals = proposals.length;
  // Combine real drafts and past proposals for stats
  const activeDraftsCount = drafts.length + proposals.filter(p => p.status === 'Draft' || p.status === 'Review').length;
  
  // Sort by date desc
  const recentProposals = [...proposals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600';
      case 'Review': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Submitted': return 'bg-purple-100 text-purple-700';
      case 'Won': return 'bg-green-100 text-green-700';
      case 'Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStepLabel = (step: AppStep) => {
    switch(step) {
        case AppStep.UPLOAD: return "RFP 파일 업로드";
        case AppStep.ANALYSIS: return "요구사항 분석";
        case AppStep.RESEARCH: return "트렌드 리서치";
        case AppStep.STRATEGY: return "전략 및 과정 매칭";
        case AppStep.PREVIEW: return "제안서 초안 검토";
        case AppStep.COMPLETE: return "완료";
        default: return "준비 중";
    }
  };

  const getStepProgress = (step: AppStep) => {
      return (step / 6) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">제안서 작업 현황 및 성과 요약</p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm">
                <FileText size={18} />
                리포트 다운로드
            </button>
            <button 
                onClick={onNewProposal}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
                <Plus size={20} />
                새 제안서 시작
            </button>
        </div>
      </div>

      {/* KPI Cards - Reduced to 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">총 제안 건수 (YTD)</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{totalProposals + 12}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 flex items-center font-medium"><ArrowUpRight size={16} className="mr-1"/> +12.5%</span>
                <span className="text-slate-400 ml-2">전월 대비</span>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">진행 중인 프로젝트</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{activeDraftsCount}</h3>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Clock size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-600 font-medium">작성 중인 초안: {drafts.length}건</span>
            </div>
        </div>
      </div>

      {/* DRAFTS SECTION (Works In Progress) */}
      {drafts.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FolderOpen size={20} className="text-blue-600" />
                작성 중인 제안서 (Drafts)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map(draft => (
                    <div key={draft.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-blue-500 group relative">
                        <div className="flex justify-between items-start mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                                {getStepLabel(draft.step)}
                            </span>
                            <span className="text-xs text-slate-400">
                                {draft.lastUpdated.toLocaleDateString()} {draft.lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        
                        <h4 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                            {draft.analysis?.programName || (draft.files[0]?.fileName ? `${draft.files[0].fileName} 분석 중` : "새로운 제안서 작업")}
                        </h4>
                        
                        <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                            <FileText size={14} />
                            {draft.analysis?.clientName || "고객사 미정"} 
                            {draft.analysis?.industry && `• ${draft.analysis.industry}`}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-5">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-slate-500">진행률</span>
                                <span className="font-bold text-blue-600">{Math.round(getStepProgress(draft.step))}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${getStepProgress(draft.step)}%` }}
                                ></div>
                            </div>
                        </div>

                        <button 
                            onClick={() => onResumeDraft(draft)}
                            className="w-full py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
                        >
                            <PlayCircle size={18} />
                            이어서 작성하기
                        </button>
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Projects Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Clock size={18} className="text-slate-500" /> 최근 완료된 프로젝트
                </h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="검색..." className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 w-32 md:w-48" />
                    </div>
                    <button className="p-1.5 border border-slate-300 rounded-md text-slate-500 hover:bg-slate-50"><Filter size={14}/></button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">프로젝트명 / 고객사</th>
                            <th className="px-6 py-3">상태</th>
                            <th className="px-6 py-3">진척도</th>
                            <th className="px-6 py-3">담당자</th>
                            <th className="px-6 py-3 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {recentProposals.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{item.title}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <span className="font-medium text-blue-600">{item.clientName}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{item.industry}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                                        {item.status || 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${item.status === 'Completed' || item.status === 'Won' ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${item.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-slate-400">{item.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">KJ</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                <button onClick={onViewAll} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    전체 프로젝트 보기
                </button>
            </div>
        </div>

        {/* Right Column: Chart & Activity */}
        <div className="space-y-6">
            
            {/* Monthly Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-slate-500" /> 월별 제안 추이
                    </h3>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={STATS_DATA}>
                            <defs>
                                <linearGradient id="colorProposals" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="proposals" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorProposals)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Activity Feed */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-slate-500" /> 오늘의 일정
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="text-xs font-bold text-slate-400">10:00</span>
                            <div className="h-full w-px bg-slate-200 my-1"></div>
                        </div>
                        <div className="pb-4">
                            <h4 className="text-sm font-bold text-slate-800">삼성전자 제안서 리뷰 회의</h4>
                            <p className="text-xs text-slate-500 mt-1">참석자: 김철수, 이영희, 박민수</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="text-xs font-bold text-slate-400">14:00</span>
                            <div className="h-full w-px bg-slate-200 my-1"></div>
                        </div>
                        <div className="pb-4">
                            <h4 className="text-sm font-bold text-slate-800">SK텔레콤 RFP 분석 완료 보고</h4>
                            <p className="text-xs text-slate-500 mt-1">AI 에이전트 분석 결과 검토</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center min-w-[3rem]">
                            <span className="text-xs font-bold text-slate-400">16:30</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">LG화학 최종 제안 제출</h4>
                            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded mt-1">D-Day</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
};
