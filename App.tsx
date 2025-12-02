
import React, { useState, useEffect } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { FileUploader } from './components/FileUploader';
import { RequirementsReview } from './components/RequirementsReview';
import { TrendResearch } from './components/TrendResearch';
import { StrategyPlanning } from './components/StrategyPlanning';
import { InstructorMatching } from './components/InstructorMatching';
import { ProposalPreview } from './components/ProposalPreview';
import { AgentManagement } from './components/AgentManagement';
import { KnowledgeHub } from './components/KnowledgeHub';
import { Dashboard } from './components/Dashboard';
import { AppStep, RFPMetadata, AnalysisResult, TrendInsight, CourseMatch, AgentConfig, PastProposal, InstructorProfile, ProposalDraft, StrategyOption } from './types';
import { Briefcase, Settings, Database, LayoutDashboard } from 'lucide-react';

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'rfp-analyst',
    name: 'RFP 전문 분석가',
    role: '고객의 RFP 문서를 분석하여 핵심 요구사항, 일정, 교육 대상 등을 구조화된 데이터로 추출합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    systemPrompt: 'You are an expert RFP analyst. Extract key information from the provided proposal request document. Identify Program Name, Objectives, Target Audience, Schedule, and requested Modules.',
    guardrails: ['Do not make up information not present in the text.', 'Flag any ambiguous dates.']
  },
  {
    id: 'trend-researcher',
    name: '트렌드 인사이트 연구원',
    role: '교육 주제와 관련된 최신 HRD 및 비즈니스 트렌드를 조사하여 제안서에 포함될 인사이트를 제공합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    systemPrompt: 'Analyze the provided education topics and generate 3 key global trends relevant to HRD and Business Leadership. Provide sources.',
    guardrails: ['Use only sources from the last 3 years.', 'Focus on enterprise-level trends.']
  },
  {
    id: 'strategy-planner',
    name: '전략 기획 에이전트',
    role: '요구사항과 트렌드를 바탕으로 3가지 차별화된 제안 전략(Option)을 수립합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    systemPrompt: 'Generate 3 distinct strategic options for the training proposal. Focus on different angles (e.g., Tech-focused, Culture-focused, Efficiency-focused).',
    guardrails: ['Ensure all options are actionable.', 'Clearly distinguish between options.']
  },
  {
    id: 'curriculum-matcher',
    name: '교육 과정 매칭 컨설턴트',
    role: '선택된 전략과 요구 모듈에 가장 적합한 내부 교육 과정과 강사를 매칭하고 추천 근거를 작성합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.4,
    systemPrompt: 'You are an expert curriculum planner. Match the following required modules with the best available internal courses. Provide a match score and justification.',
    guardrails: ['Prioritize internal full-time instructors.', 'Match score must be based on keyword relevance.']
  },
  {
    id: 'proposal-assembler',
    name: '제안서 작성 전문 에디터',
    role: '분석된 정보와 생성된 콘텐츠를 바탕으로 전문적인 PPT 제안서 구조와 문구를 생성합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    systemPrompt: 'Generate professional slide content for a corporate training proposal. Use persuasive language and structured formatting.',
    guardrails: ['Ensure tone is professional and polite.', 'Include a clear call to action.']
  },
  {
    id: 'qa-agent',
    name: '제안 품질 심사위원',
    role: '전략 수립 단계에서 조언을 제공하고, 최종 제안서의 품질을 평가합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.1,
    systemPrompt: 'You are a strict Quality Assurance auditor for training proposals. Evaluate the proposal based on compliance, expertise, and fit. Provide scores (0-100) and critical reasoning.',
    guardrails: ['Be objective and critical.', 'Do not hallucinate scores.', 'Provide constructive feedback.']
  }
];

// Mock Data for Knowledge Hub & Dashboard with Dummy QA Data
const MOCK_PROPOSALS: PastProposal[] = [
    { 
      id: 'p1', 
      title: '2025 삼성전자 신입사원 입문교육 제안', 
      clientName: '삼성전자', 
      industry: '제조/전자', 
      date: '2024-03-20', 
      tags: ['신입사원', '비전내재화', '팀빌딩'], 
      fileName: '2025_SE_Rookie_Draft.pptx',
      status: 'Won', 
      amount: '₩120,000,000',
      progress: 100,
      qualityAssessment: {
        complianceScore: 95,
        complianceReason: "RFP의 모든 핵심 요구사항을 완벽하게 충족하며, 신입사원 교육의 목적과 부합함.",
        instructorExpertiseScore: 88,
        instructorExpertiseReason: "MZ세대 소통 전문가 위주로 강사진이 구성되어 적절함.",
        industryMatchScore: 92,
        industryMatchReason: "전자/제조 업계의 최신 트렌드와 용어를 적절히 반영함.",
        totalScore: 91,
        overallComment: "매우 우수한 제안서입니다. 수주 가능성이 높습니다."
      }
    },
    { 
      id: 'p2', 
      title: 'KB국민은행 디지털 리더십 아카데미', 
      clientName: 'KB국민은행', 
      industry: '금융', 
      date: '2024-03-15', 
      tags: ['리더십', 'DT', '금융트렌드'], 
      fileName: 'KB_Digital_Leadership_v2.pptx',
      status: 'Lost',
      amount: '₩85,000,000',
      progress: 100,
      qualityAssessment: {
        complianceScore: 78,
        complianceReason: "디지털 리더십 관련 핵심 모듈은 포함되었으나, 일부 실습 과정이 RFP 요구사항보다 축소됨.",
        instructorExpertiseScore: 92,
        instructorExpertiseReason: "금융권 DT 프로젝트 경험이 풍부한 강사진으로 구성됨.",
        industryMatchScore: 85,
        industryMatchReason: "금융 트렌드를 반영한 사례 연구가 적절히 포함됨.",
        totalScore: 85,
        overallComment: "강사진의 전문성은 뛰어나나, 실습 시간 확보를 위한 커리큘럼 조정이 필요함."
      }
    },
    {
      id: 'p3',
      title: 'SK하이닉스 반도체 입문 과정',
      clientName: 'SK하이닉스',
      industry: '제조/반도체',
      date: '2024-02-10',
      tags: ['반도체', '공정', '품질'],
      fileName: 'SK_Semi_Intro_v3.pptx',
      status: 'Submitted',
      amount: '₩210,000,000',
      progress: 100,
      qualityAssessment: undefined
    }
];

const MOCK_INSTRUCTORS: InstructorProfile[] = [
    { id: 'i1', name: '김철수 수석', position: '리더십 센터장', expertise: ['리더십', '코칭', '조직문화'], bio: '전 삼성인력개발원 교수, 리더십 코칭 15년 경력', email: 'cs.kim@expert.co.kr' },
    { id: 'i2', name: '이영희 이사', position: 'DT 교육팀장', expertise: ['디지털 트렌드', '데이터 리터러시', '생성형 AI'], bio: '카이스트 공학박사, 빅데이터 분석 전문가', email: 'yh.lee@expert.co.kr' },
    { id: 'i3', name: '박민수 전문위원', position: '커뮤니케이션 파트장', expertise: ['소통', '협상', '갈등관리'], bio: '국제공인 협상 전문가, 커뮤니케이션 저서 3권 집필', email: 'ms.park@expert.co.kr' },
    { id: 'i4', name: '최지혜 컨설턴트', position: 'CS 교육팀', expertise: ['고객경험(CX)', '서비스 마인드', '감정노동 관리'], bio: '전 항공사 승무원 교육 담당', email: 'jh.choi@expert.co.kr' },
];

const MOCK_DRAFTS: ProposalDraft[] = [
    {
        id: 'draft-dummy-1',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        step: AppStep.ANALYSIS,
        files: [
            { fileName: '2025_Global_Leadership_RFP.pdf', fileSize: '4.2 MB', uploadDate: '2024-05-21' },
            { fileName: 'Reference_Material.pdf', fileSize: '1.8 MB', uploadDate: '2024-05-21' }
        ],
        analysis: null,
        trends: [],
        matches: []
    },
    {
        id: 'draft-dummy-2',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        step: AppStep.PREVIEW,
        files: [
            { fileName: '2025_Hyundai_Mobis_Safety_RFP.pdf', fileSize: '5.1 MB', uploadDate: '2024-05-20' }
        ],
        analysis: {
            clientName: "현대모비스",
            industry: "제조/자동차",
            department: "안전환경팀",
            programName: "2025 현장 안전 리더십 워크숍",
            objectives: ["중대재해처벌법 대응", "안전 심리 코칭", "현장 소통 강화"],
            targetAudience: "현장 관리감독자 (120명)",
            schedule: "2025년 8월",
            location: "마북 연수원",
            modules: ["Safety Psychology", "Legal Compliance", "Communication"],
            specialRequests: "실제 사고 사례 기반 토의 필수"
        },
        trends: [
            { topic: "Safety Culture 2.0", insight: "규제 중심에서 자율 안전 문화로의 전환", source: "OSHA Trends", relevanceScore: 92 },
            { topic: "VR Safety Training", insight: "몰입형 기술을 활용한 위험 예지 훈련", source: "HRD Korea", relevanceScore: 85 }
        ],
        selectedStrategy: {
            id: "strat-safety-1",
            title: "Psychological Safety First",
            description: "심리적 접근을 통해 자발적 안전 행동을 유도합니다.",
            keywords: ["Psychology", "Culture", "Behavior"],
            rationale: "규제 준수를 넘어선 행동 변화 유도에 최적화됨",
            qaScore: 92,
            qaAdvice: "현장 적용성이 매우 높음"
        },
        matches: [
             {
                id: "match-s1",
                moduleName: "Safety Psychology",
                courseTitle: "행동 기반 안전 심리 코칭",
                instructor: "박안전 수석",
                matchReason: "심리학 박사 학위 보유 및 건설 현장 컨설팅 경험 풍부",
                matchScore: 95,
                isExternal: false
             }
        ]
    }
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  
  // Active Proposal Data
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<RFPMetadata[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyOption | undefined>(undefined);
  const [matches, setMatches] = useState<CourseMatch[]>([]);
  
  // Global App State
  const [view, setView] = useState<'dashboard' | 'wizard' | 'agents' | 'knowledge'>('dashboard');
  const [drafts, setDrafts] = useState<ProposalDraft[]>(MOCK_DRAFTS);
  
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(DEFAULT_AGENTS);
  const [apiKey, setApiKey] = useState<string>('');
  const [globalModel, setGlobalModel] = useState<string>('gemini-2.5-flash');
  
  const [pastProposals, setPastProposals] = useState<PastProposal[]>(MOCK_PROPOSALS);
  const [instructors, setInstructors] = useState<InstructorProfile[]>(MOCK_INSTRUCTORS);

  // Helper to update the current draft in the drafts list whenever state changes
  const updateDraft = (
    id: string, 
    updates: Partial<ProposalDraft>
  ) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates, lastUpdated: new Date() } : d));
  };

  const handleDeleteDraft = (id: string) => {
      setDrafts(prev => prev.filter(d => d.id !== id));
      if (currentDraftId === id) {
          setCurrentDraftId(null);
          setView('dashboard');
      }
  };

  // Handlers to advance steps
  const handleUploadComplete = (files: RFPMetadata[]) => {
    const shouldSave = window.confirm("파일 업로드 완료. 제안서 초안을 저장하고 분석을 진행하시겠습니까?");
    
    setUploadedFiles(files);
    setCurrentStep(AppStep.ANALYSIS);
    
    if (shouldSave) {
        if (currentDraftId) {
            updateDraft(currentDraftId, { files, step: AppStep.ANALYSIS });
        } else {
             // Create new draft only if user confirms
             const newDraftId = Date.now().toString();
             const newDraft: ProposalDraft = {
                 id: newDraftId,
                 lastUpdated: new Date(),
                 step: AppStep.ANALYSIS,
                 files: files,
                 analysis: null,
                 trends: [],
                 matches: []
             };
             setDrafts(prev => [newDraft, ...prev]);
             setCurrentDraftId(newDraftId);
        }
    }
  };

  const handleAnalysisConfirm = (data: AnalysisResult) => {
    setAnalysisResult(data);
    setCurrentStep(AppStep.RESEARCH);
    if (currentDraftId) {
        if(window.confirm("요구사항 분석 결과를 저장하시겠습니까?")) {
            updateDraft(currentDraftId, { analysis: data, step: AppStep.RESEARCH });
        }
    }
  };

  const handleResearchComplete = (trendData: TrendInsight[]) => {
    setTrends(trendData);
    setCurrentStep(AppStep.STRATEGY);
    if (currentDraftId) {
        if(window.confirm("트렌드 분석 결과를 저장하시겠습니까?")) {
            updateDraft(currentDraftId, { trends: trendData, step: AppStep.STRATEGY });
        }
    }
  };

  const handleStrategyComplete = (strategy: StrategyOption) => {
    setSelectedStrategy(strategy);
    setCurrentStep(AppStep.MATCHING);
    if (currentDraftId) {
        if(window.confirm("선택한 제안 전략을 저장하시겠습니까?")) {
            updateDraft(currentDraftId, { selectedStrategy: strategy, step: AppStep.MATCHING });
        }
    }
  };

  const handleMatchingComplete = (matchData: CourseMatch[]) => {
    setMatches(matchData);
    setCurrentStep(AppStep.PREVIEW);
    if (currentDraftId) {
        if(window.confirm("과정 매칭 결과를 저장하시겠습니까?")) {
            updateDraft(currentDraftId, { matches: matchData, step: AppStep.PREVIEW });
        }
    }
  };

  const handleBack = () => {
    if (currentStep > AppStep.UPLOAD) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (currentDraftId) {
        // Automatically save step navigation
        updateDraft(currentDraftId, { step: prevStep });
      }
    }
  };

  const handleSaveAgents = (updatedAgents: AgentConfig[]) => {
    setAgentConfigs(updatedAgents);
  };

  const startNewProposal = () => {
    // Reset State
    setUploadedFiles([]);
    setAnalysisResult(null);
    setTrends([]);
    setSelectedStrategy(undefined);
    setMatches([]);
    setCurrentStep(AppStep.UPLOAD);
    setCurrentDraftId(null);
    setView('wizard');
  };

  const resumeDraft = (draft: ProposalDraft) => {
      // Restore State
      setCurrentDraftId(draft.id);
      setUploadedFiles(draft.files);
      setAnalysisResult(draft.analysis);
      setTrends(draft.trends);
      setSelectedStrategy(draft.selectedStrategy);
      setMatches(draft.matches);
      setCurrentStep(draft.step);
      setView('wizard');
  };

  const handleUpdateDraftStatus = (id: string, newStatus: 'Won' | 'Lost') => {
      const draft = drafts.find(d => d.id === id);
      if (!draft) return;

      if(window.confirm(`이 제안서를 '${newStatus === 'Won' ? '수주 성공' : '수주 실패'}' 상태로 변경하고 아카이브 하시겠습니까?`)) {
          // Create a past proposal entry
          const newProposal: PastProposal = {
              id: draft.id,
              title: draft.analysis?.programName || 'Untitled Project',
              clientName: draft.analysis?.clientName || 'Unknown Client',
              industry: draft.analysis?.industry || 'Unknown Industry',
              date: new Date().toISOString().split('T')[0],
              tags: draft.analysis?.modules || [],
              fileName: draft.files[0]?.fileName || 'proposal_final.pptx',
              status: newStatus,
              amount: newStatus === 'Won' ? '₩50,000,000' : '₩0', // Dummy amount
              progress: 100,
              qualityAssessment: undefined 
          };

          setPastProposals(prev => [newProposal, ...prev]);
          setDrafts(prev => prev.filter(d => d.id !== id));
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-blue-600 p-1.5 rounded-lg">
               <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Expert<span className="text-blue-400">Consulting</span></span>
            <span className="hidden sm:inline-block ml-2 text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">Proposal Automation</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
             {/* Navigation Buttons */}
             <div className="flex bg-slate-800 rounded-lg p-1 mr-4">
                 <button 
                    onClick={() => setView('dashboard')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                 >
                    <LayoutDashboard size={16} />
                    <span className="hidden md:inline">대시보드</span>
                 </button>
                 <button 
                    onClick={() => setView('knowledge')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${view === 'knowledge' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                 >
                    <Database size={16} />
                    <span className="hidden md:inline">지식 허브</span>
                 </button>
                 <button 
                    onClick={() => setView('agents')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${view === 'agents' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                 >
                    <Settings size={16} />
                    <span className="hidden md:inline">에이전트 설정</span>
                 </button>
             </div>

             <span className="w-px h-4 bg-slate-700 mx-1"></span>
             <span className="hidden sm:block text-slate-400">안녕하세요, 김제안 수석컨설턴트님</span>
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-xs font-bold">KJ</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {view === 'dashboard' ? (
           <Dashboard 
              proposals={pastProposals} 
              drafts={drafts}
              onNewProposal={startNewProposal} 
              onResumeDraft={resumeDraft}
              onViewAll={() => setView('knowledge')} 
              onUpdateDraftStatus={handleUpdateDraftStatus}
              onDeleteDraft={handleDeleteDraft}
            />
        ) : view === 'knowledge' ? (
           <KnowledgeHub 
              proposals={pastProposals} 
              instructors={instructors}
              onUpdateProposals={setPastProposals}
              onUpdateInstructors={setInstructors}
              onClose={() => setView('dashboard')}
              apiKey={apiKey}
              agentConfigs={agentConfigs}
              globalModel={globalModel}
           />
        ) : view === 'agents' ? (
           <AgentManagement 
              agents={agentConfigs} 
              onSave={handleSaveAgents} 
              onClose={() => setView('dashboard')} 
              apiKey={apiKey}
              onSaveApiKey={setApiKey}
              globalModel={globalModel}
              onSaveGlobalModel={setGlobalModel}
           />
        ) : (
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
              <StepIndicator currentStep={currentStep} />
              
              <div className="min-h-[500px]">
                {currentStep === AppStep.UPLOAD && (
                  <FileUploader onUploadComplete={handleUploadComplete} />
                )}
                
                {currentStep === AppStep.ANALYSIS && (
                  <RequirementsReview 
                    files={uploadedFiles} 
                    onConfirm={handleAnalysisConfirm}
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'rfp-analyst')}
                    initialData={analysisResult}
                    apiKey={apiKey}
                    globalModel={globalModel}
                  />
                )}
                
                {currentStep === AppStep.RESEARCH && analysisResult && (
                  <TrendResearch 
                    analysisData={analysisResult} 
                    onNext={handleResearchComplete}
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'trend-researcher')}
                    initialData={trends}
                    apiKey={apiKey}
                    globalModel={globalModel}
                  />
                )}
                
                {currentStep === AppStep.STRATEGY && analysisResult && (
                  <StrategyPlanning 
                    analysisData={analysisResult}
                    trendData={trends}
                    onNext={handleStrategyComplete}
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'strategy-planner')}
                    qaAgentConfig={agentConfigs.find(a => a.id === 'qa-agent')}
                    apiKey={apiKey}
                    globalModel={globalModel}
                  />
                )}

                {currentStep === AppStep.MATCHING && analysisResult && (
                  <InstructorMatching 
                    analysisData={analysisResult}
                    trendData={trends}
                    selectedStrategy={selectedStrategy}
                    onNext={handleMatchingComplete}
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'curriculum-matcher')}
                    initialData={matches}
                    apiKey={apiKey}
                    globalModel={globalModel}
                  />
                )}
                
                {currentStep === AppStep.PREVIEW && analysisResult && (
                  <ProposalPreview 
                    analysis={analysisResult}
                    trends={trends}
                    matches={matches}
                    agentConfigs={agentConfigs}
                    apiKey={apiKey}
                    globalModel={globalModel}
                    onBack={handleBack}
                  />
                )}
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
