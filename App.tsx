
import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { FileUploader } from './components/FileUploader';
import { RequirementsReview } from './components/RequirementsReview';
import { TrendResearch } from './components/TrendResearch';
import { StrategyPlanning } from './components/StrategyPlanning';
import { ProposalPreview } from './components/ProposalPreview';
import { AgentManagement } from './components/AgentManagement';
import { KnowledgeHub } from './components/KnowledgeHub';
import { AppStep, RFPMetadata, AnalysisResult, TrendInsight, CourseMatch, AgentConfig, PastProposal, InstructorProfile } from './types';
import { Briefcase, Settings, Database } from 'lucide-react';

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'rfp-analyst',
    name: 'RFP Analysis Agent',
    role: '고객의 RFP 문서를 분석하여 핵심 요구사항, 일정, 교육 대상 등을 구조화된 데이터로 추출합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    systemPrompt: 'You are an expert RFP analyst. Extract key information from the provided proposal request document. Identify Program Name, Objectives, Target Audience, Schedule, and requested Modules.',
    guardrails: ['Do not make up information not present in the text.', 'Flag any ambiguous dates.']
  },
  {
    id: 'trend-researcher',
    name: 'Trend Research Agent',
    role: '교육 주제와 관련된 최신 HRD 및 비즈니스 트렌드를 조사하여 제안서에 포함될 인사이트를 제공합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    systemPrompt: 'Analyze the provided education topics and generate 3 key global trends relevant to HRD and Business Leadership. Provide sources.',
    guardrails: ['Use only sources from the last 3 years.', 'Focus on enterprise-level trends.']
  },
  {
    id: 'curriculum-matcher',
    name: 'Curriculum Matching Agent',
    role: '고객의 요구 모듈에 가장 적합한 내부 교육 과정과 강사를 매칭하고 추천 근거를 작성합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.4,
    systemPrompt: 'You are an expert curriculum planner. Match the following required modules with the best available internal courses. Provide a match score and justification.',
    guardrails: ['Prioritize internal full-time instructors.', 'Match score must be based on keyword relevance.']
  },
  {
    id: 'proposal-assembler',
    name: 'Proposal Assembly Agent',
    role: '분석된 정보와 생성된 콘텐츠를 바탕으로 전문적인 PPT 제안서 구조와 문구를 생성합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    systemPrompt: 'Generate professional slide content for a corporate training proposal. Use persuasive language and structured formatting.',
    guardrails: ['Ensure tone is professional and polite.', 'Include a clear call to action.']
  },
  {
    id: 'qa-agent',
    name: 'Proposal QA Agent',
    role: '최종 생성된 제안서의 품질을 평가합니다. RFP 준수 여부, 강사 전문성, 산업군 적합성을 평가하여 점수와 이유를 제공합니다.',
    model: 'gemini-2.5-flash',
    temperature: 0.1,
    systemPrompt: 'You are a strict Quality Assurance auditor for training proposals. Evaluate the proposal based on: 1. Data Compliance (adherence to RFP), 2. Instructor Expertise Match, 3. Industry Fit. Provide scores (0-100) and critical reasoning.',
    guardrails: ['Be objective and critical.', 'Do not hallucinate scores.', 'Provide constructive feedback.']
  }
];

// Mock Data for Knowledge Hub
const MOCK_PROPOSALS: PastProposal[] = [
    { id: 'p1', title: '2024 삼성전자 신입사원 입문교육 제안', clientName: '삼성전자', industry: '제조/전자', date: '2024-01-15', tags: ['신입사원', '비전내재화', '팀빌딩'], fileName: '2024_SE_Rookie.pptx' },
    { id: 'p2', title: 'KB국민은행 디지털 리더십 아카데미', clientName: 'KB국민은행', industry: '금융', date: '2023-11-20', tags: ['리더십', 'DT', '금융트렌드'], fileName: 'KB_Digital_Leadership_v2.pptx' },
    { id: 'p3', title: 'SK텔레콤 AI-Driven Work Way 워크숍', clientName: 'SK텔레콤', industry: '통신/IT', date: '2024-03-10', tags: ['AI활용', '업무효율화', '애자일'], fileName: 'SKT_AI_Work.pdf' },
    { id: 'p4', title: 'LG화학 중간관리자 성과관리 과정', clientName: 'LG화학', industry: '화학/제조', date: '2023-09-05', tags: ['성과관리', '코칭', '피드백'], fileName: 'LG_Chem_PM.pptx' },
];

const MOCK_INSTRUCTORS: InstructorProfile[] = [
    { id: 'i1', name: '김철수 수석', position: '리더십 센터장', expertise: ['리더십', '코칭', '조직문화'], bio: '전 삼성인력개발원 교수, 리더십 코칭 15년 경력', email: 'cs.kim@expert.co.kr' },
    { id: 'i2', name: '이영희 이사', position: 'DT 교육팀장', expertise: ['디지털 트렌드', '데이터 리터러시', '생성형 AI'], bio: '카이스트 공학박사, 빅데이터 분석 전문가', email: 'yh.lee@expert.co.kr' },
    { id: 'i3', name: '박민수 전문위원', position: '커뮤니케이션 파트장', expertise: ['소통', '협상', '갈등관리'], bio: '국제공인 협상 전문가, 커뮤니케이션 저서 3권 집필', email: 'ms.park@expert.co.kr' },
    { id: 'i4', name: '최지혜 컨설턴트', position: 'CS 교육팀', expertise: ['고객경험(CX)', '서비스 마인드', '감정노동 관리'], bio: '전 항공사 승무원 교육 담당', email: 'jh.choi@expert.co.kr' },
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedFiles, setUploadedFiles] = useState<RFPMetadata[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  const [matches, setMatches] = useState<CourseMatch[]>([]);
  
  // Navigation View State
  const [view, setView] = useState<'wizard' | 'agents' | 'knowledge'>('wizard');
  
  // Data State
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(DEFAULT_AGENTS);
  const [apiKey, setApiKey] = useState<string>('');
  
  // Knowledge Hub State
  const [pastProposals, setPastProposals] = useState<PastProposal[]>(MOCK_PROPOSALS);
  const [instructors, setInstructors] = useState<InstructorProfile[]>(MOCK_INSTRUCTORS);

  // Handlers to advance steps
  const handleUploadComplete = (files: RFPMetadata[]) => {
    setUploadedFiles(files);
    setCurrentStep(AppStep.ANALYSIS);
  };

  const handleAnalysisConfirm = (data: AnalysisResult) => {
    setAnalysisResult(data);
    setCurrentStep(AppStep.RESEARCH);
  };

  const handleResearchComplete = (trendData: TrendInsight[]) => {
    setTrends(trendData);
    setCurrentStep(AppStep.STRATEGY);
  };

  const handleStrategyComplete = (matchData: CourseMatch[]) => {
    setMatches(matchData);
    setCurrentStep(AppStep.PREVIEW);
  };

  const handleBack = () => {
    if (currentStep > AppStep.UPLOAD) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveAgents = (updatedAgents: AgentConfig[]) => {
    setAgentConfigs(updatedAgents);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('wizard')}>
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
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">K</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'agents' ? (
            <AgentManagement 
                agents={agentConfigs} 
                onSave={handleSaveAgents}
                onClose={() => setView('wizard')}
                apiKey={apiKey}
                onSaveApiKey={setApiKey}
            />
        ) : view === 'knowledge' ? (
            <KnowledgeHub 
                proposals={pastProposals}
                instructors={instructors}
                onUpdateProposals={setPastProposals}
                onUpdateInstructors={setInstructors}
                onClose={() => setView('wizard')}
            />
        ) : (
            <div className="animate-fade-in-up">
                <StepIndicator currentStep={currentStep} />

                {currentStep === AppStep.UPLOAD && (
                    <FileUploader onUploadComplete={handleUploadComplete} />
                )}

                {currentStep === AppStep.ANALYSIS && uploadedFiles.length > 0 && (
                    <RequirementsReview 
                    files={uploadedFiles} 
                    onConfirm={handleAnalysisConfirm} 
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'rfp-analyst')}
                    initialData={analysisResult}
                    apiKey={apiKey}
                    />
                )}

                {/* Split Step 1: Trend Research */}
                {currentStep === AppStep.RESEARCH && analysisResult && (
                    <TrendResearch
                    analysisData={analysisResult}
                    onNext={handleResearchComplete}
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'trend-researcher')}
                    initialData={trends}
                    apiKey={apiKey}
                    />
                )}

                {/* Split Step 2: Strategy Planning (Matching) */}
                {currentStep === AppStep.STRATEGY && analysisResult && (
                    <StrategyPlanning 
                    analysisData={analysisResult} 
                    trendData={trends}
                    onNext={handleStrategyComplete} 
                    onBack={handleBack}
                    agentConfig={agentConfigs.find(a => a.id === 'curriculum-matcher')}
                    initialData={matches}
                    apiKey={apiKey}
                    />
                )}

                {currentStep >= AppStep.PREVIEW && analysisResult && (
                    <ProposalPreview 
                    analysis={analysisResult}
                    trends={trends}
                    matches={matches}
                    agentConfigs={agentConfigs}
                    apiKey={apiKey}
                    />
                )}
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; 2025 Expert Consulting. All rights reserved.</p>
          <p>Powered by Gemini 2.5 Multi-Agent System</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
