
import React, { useState } from 'react';
import { PastProposal, InstructorProfile, AgentConfig, QualityAssessment } from '../types';
import { evaluatePastProposal } from '../services/geminiService';
import { Database, FileText, User, Search, Plus, Trash2, Tag, Calendar, Building2, Mail, GraduationCap, X, ShieldCheck, AlertCircle, BarChart3 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  proposals: PastProposal[];
  instructors: InstructorProfile[];
  onUpdateProposals: (data: PastProposal[]) => void;
  onUpdateInstructors: (data: InstructorProfile[]) => void;
  onClose: () => void;
  apiKey?: string;
  agentConfigs?: AgentConfig[];
}

// Helper component for a single donut chart
const SingleDonut = ({ score, label }: { score: number; label: string }) => {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Traffic light color logic
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 60) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };
  
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-slate-700">{score}</span>
      </div>
      <span className="text-[10px] font-semibold text-slate-500">{label}</span>
    </div>
  );
};

// Component to display 3 separate donuts with a tooltip on hover
const TripleScoreGauge = ({ assessment }: { assessment: QualityAssessment }) => {
  return (
    <div className="group relative flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 cursor-help transition-all hover:bg-white hover:border-blue-200 hover:shadow-md">
      <SingleDonut score={assessment.complianceScore} label="규정 준수" />
      <div className="w-px h-8 bg-slate-200"></div>
      <SingleDonut score={assessment.instructorExpertiseScore} label="전문성" />
      <div className="w-px h-8 bg-slate-200"></div>
      <SingleDonut score={assessment.industryMatchScore} label="산업 적합" />
      
      {/* Tooltip: Positioned to the left */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-72 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none translate-x-2 group-hover:translate-x-0 border border-slate-700">
          <div className="flex items-center gap-2 font-bold text-teal-400 mb-2 pb-2 border-b border-slate-700">
             <ShieldCheck size={14} />
             <span>AI 종합 평가 요약</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            "{assessment.overallComment}"
          </p>
          {/* Arrow pointing right */}
          <div className="absolute top-1/2 -right-2 -mt-1.5 border-8 border-transparent border-l-slate-900"></div>
      </div>
    </div>
  );
};

export const KnowledgeHub: React.FC<Props> = ({ proposals, instructors, onUpdateProposals, onUpdateInstructors, onClose, apiKey, agentConfigs }) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'instructors'>('proposals');
  const [searchTerm, setSearchTerm] = useState('');
  
  // QA Modal State
  const [selectedProposal, setSelectedProposal] = useState<PastProposal | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Filtering logic
  const filteredProposals = proposals.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.industry.includes(searchTerm)
  );

  const filteredInstructors = instructors.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteProposal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 제안서 데이터를 삭제하시겠습니까?')) {
      onUpdateProposals(proposals.filter(p => p.id !== id));
      if (selectedProposal?.id === id) {
          setSelectedProposal(null);
      }
    }
  };

  const handleDeleteInstructor = (id: string) => {
    if (confirm('이 강사 프로필을 삭제하시겠습니까?')) {
      onUpdateInstructors(instructors.filter(i => i.id !== id));
    }
  };

  const handleOpenQA = async (proposal: PastProposal) => {
      setSelectedProposal(proposal);
      
      // If no assessment exists, auto-evaluate
      if (!proposal.qualityAssessment) {
          setIsEvaluating(true);
          const qaAgent = agentConfigs?.find(a => a.id === 'qa-agent');
          const assessment = await evaluatePastProposal(proposal, qaAgent?.systemPrompt, apiKey);
          
          // Update the proposal with the new assessment
          const updatedProposals = proposals.map(p => 
              p.id === proposal.id ? { ...p, qualityAssessment: assessment } : p
          );
          onUpdateProposals(updatedProposals);
          
          // Update local selected state to reflect the change
          setSelectedProposal({ ...proposal, qualityAssessment: assessment });
          setIsEvaluating(false);
      }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 65) return "text-orange-600"; // Changed to orange for amber range
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up h-[calc(100vh-100px)] flex flex-col relative">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="text-blue-600" />
            지식 허브 (Knowledge Hub)
          </h2>
          <p className="text-slate-500 mt-1">AI 에이전트가 참조하는 과거 제안서 아카이브와 강사 데이터베이스를 관리합니다.</p>
        </div>
        <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
            닫기
        </button>
      </div>

      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 min-h-0">
        
        {/* Tabs & Toolbar */}
        <div className="flex flex-col sm:flex-row border-b border-slate-200">
            <div className="flex">
                <button
                    onClick={() => setActiveTab('proposals')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors
                        ${activeTab === 'proposals' 
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <FileText size={18} />
                    과거 제안서 라이브러리
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">{proposals.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('instructors')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors
                        ${activeTab === 'instructors' 
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <User size={18} />
                    내부 강사 DB
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">{instructors.length}</span>
                </button>
            </div>
            
            <div className="flex-1 p-3 flex items-center justify-end gap-3 bg-slate-50/50">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={activeTab === 'proposals' ? "제안서 제목, 고객사, 산업군 검색..." : "강사명, 전문분야 검색..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={16} />
                    {activeTab === 'proposals' ? '제안서 업로드' : '강사 추가'}
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {activeTab === 'proposals' ? (
                // --- Past Proposals List ---
                <div className="space-y-4">
                    {filteredProposals.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">검색 결과가 없습니다.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredProposals.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                                    <div className="flex gap-4 items-start flex-1 min-w-0">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <FileText size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-800 text-lg mb-1 truncate pr-4">{item.title}</h4>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-2">
                                                <span className="flex items-center gap-1"><Building2 size={14}/> {item.clientName}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="flex items-center gap-1"><Tag size={14}/> {item.industry}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="flex items-center gap-1"><Calendar size={14}/> {item.date}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {item.tags.map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 md:gap-6 self-end md:self-auto">
                                        {/* Score Indicator (Triple Donut) */}
                                        {item.qualityAssessment && (
                                            <div className="animate-fade-in">
                                               <TripleScoreGauge assessment={item.qualityAssessment} />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleOpenQA(item)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border
                                                    ${item.qualityAssessment 
                                                        ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' 
                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200'
                                                    }`} 
                                                title="품질 평가 리포트 보기"
                                            >
                                                {item.qualityAssessment ? (
                                                    <><BarChart3 size={18} /> 상세</>
                                                ) : (
                                                    <><ShieldCheck size={18} /> AI 평가</>
                                                )}
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteProposal(item.id, e)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
                                                title="삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // --- Instructors Grid ---
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredInstructors.length === 0 ? (
                         <div className="col-span-full text-center py-20 text-slate-400">검색 결과가 없습니다.</div>
                    ) : (
                        filteredInstructors.map((instructor) => (
                            <div key={instructor.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group relative">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDeleteInstructor(instructor.id)}
                                        className="p-1.5 bg-white/80 text-slate-400 hover:text-red-500 rounded-full shadow-sm"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-white">
                                    <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 border border-slate-200 mb-3 shadow-sm">
                                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            {instructor.imageUrl ? (
                                                <img src={instructor.imageUrl} alt={instructor.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={32} />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{instructor.name}</h3>
                                    <p className="text-blue-600 text-sm font-medium">{instructor.position}</p>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <GraduationCap size={12}/> 전문 분야
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {instructor.expertise.map((exp, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                                                    {exp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                            <Mail size={14} /> {instructor.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {/* QA Result Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-teal-50">
                    <div>
                         <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                             <ShieldCheck size={24} />
                             제안서 품질 평가 리포트
                         </h3>
                         <p className="text-sm text-teal-700 mt-1">{selectedProposal.title}</p>
                    </div>
                    <button onClick={() => setSelectedProposal(null)} className="p-2 hover:bg-teal-100 rounded-full text-teal-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {isEvaluating ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-6"></div>
                            <h4 className="text-xl font-bold text-slate-800">QA 에이전트 평가 중...</h4>
                            <p className="text-slate-500 mt-2">제안서 메타데이터를 분석하여 품질 점수를 산출하고 있습니다.</p>
                        </div>
                    ) : selectedProposal.qualityAssessment ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Radar Chart */}
                            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                                <h4 className="text-sm font-bold text-slate-500 mb-4 w-full text-center">평가 영역별 점수 (Radar)</h4>
                                <div className="h-64 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                            { subject: '데이터 준수', A: selectedProposal.qualityAssessment.complianceScore, fullMark: 100 },
                                            { subject: '강사 전문성', A: selectedProposal.qualityAssessment.instructorExpertiseScore, fullMark: 100 },
                                            { subject: '산업 적합성', A: selectedProposal.qualityAssessment.industryMatchScore, fullMark: 100 },
                                        ]}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                            <Radar name="Score" dataKey="A" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.5} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-0 right-0 bg-teal-600 text-white px-3 py-1.5 rounded-lg shadow-md">
                                        <div className="text-[10px] opacity-80 uppercase font-bold">Total Score</div>
                                        <div className="text-xl font-bold text-center">{selectedProposal.qualityAssessment.totalScore}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Detailed Analysis */}
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700">데이터 준수 (Compliance)</span>
                                        <span className={`font-bold ${getScoreColor(selectedProposal.qualityAssessment.complianceScore)}`}>
                                            {selectedProposal.qualityAssessment.complianceScore}점
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedProposal.qualityAssessment.complianceReason}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700">강사 전문성 (Expertise)</span>
                                        <span className={`font-bold ${getScoreColor(selectedProposal.qualityAssessment.instructorExpertiseScore)}`}>
                                            {selectedProposal.qualityAssessment.instructorExpertiseScore}점
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedProposal.qualityAssessment.instructorExpertiseReason}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-700">산업 적합성 (Industry Fit)</span>
                                        <span className={`font-bold ${getScoreColor(selectedProposal.qualityAssessment.industryMatchScore)}`}>
                                            {selectedProposal.qualityAssessment.industryMatchScore}점
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedProposal.qualityAssessment.industryMatchReason}</p>
                                </div>

                                <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-lg flex gap-3">
                                    <AlertCircle className="text-teal-600 flex-shrink-0" size={20} />
                                    <div>
                                        <h5 className="font-bold text-teal-800 text-sm mb-1">QA 총평</h5>
                                        <p className="text-sm text-teal-700">{selectedProposal.qualityAssessment.overallComment}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500">평가 정보를 불러오는데 실패했습니다.</div>
                    )}
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button 
                        onClick={() => setSelectedProposal(null)}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
