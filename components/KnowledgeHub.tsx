
import React, { useState } from 'react';
import { PastProposal, InstructorProfile } from '../types';
import { Database, FileText, User, Search, Plus, Trash2, Tag, Calendar, Building2, Mail, GraduationCap, X } from 'lucide-react';

interface Props {
  proposals: PastProposal[];
  instructors: InstructorProfile[];
  onUpdateProposals: (data: PastProposal[]) => void;
  onUpdateInstructors: (data: InstructorProfile[]) => void;
  onClose: () => void;
}

export const KnowledgeHub: React.FC<Props> = ({ proposals, instructors, onUpdateProposals, onUpdateInstructors, onClose }) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'instructors'>('proposals');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDeleteProposal = (id: string) => {
    if (confirm('이 제안서 데이터를 삭제하시겠습니까?')) {
      onUpdateProposals(proposals.filter(p => p.id !== id));
    }
  };

  const handleDeleteInstructor = (id: string) => {
    if (confirm('이 강사 프로필을 삭제하시겠습니까?')) {
      onUpdateInstructors(instructors.filter(i => i.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up h-[calc(100vh-100px)] flex flex-col">
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
                                <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-start justify-between group">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg mb-1">{item.title}</h4>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
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
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="상세 보기">
                                            <FileText size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteProposal(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" 
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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
    </div>
  );
};
