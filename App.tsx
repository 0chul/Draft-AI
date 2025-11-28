import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { FileUploader } from './components/FileUploader';
import { RequirementsReview } from './components/RequirementsReview';
import { ResearchAndMatching } from './components/ResearchAndMatching';
import { ProposalPreview } from './components/ProposalPreview';
import { AgentManagement } from './components/AgentManagement';
import { AppStep, RFPMetadata, AnalysisResult, TrendInsight, CourseMatch, AgentConfig } from './types';
import { Briefcase, Settings } from 'lucide-react';

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

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedFiles, setUploadedFiles] = useState<RFPMetadata[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  const [matches, setMatches] = useState<CourseMatch[]>([]);
  
  // New State for Agent Management
  const [view, setView] = useState<'wizard' | 'agents'>('wizard');
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(DEFAULT_AGENTS);

  // Handlers to advance steps
  const handleUploadComplete = (files: RFPMetadata[]) => {
    setUploadedFiles(files);
    setCurrentStep(AppStep.ANALYSIS);
  };

  const handleAnalysisConfirm = (data: AnalysisResult) => {
    setAnalysisResult(data);
    setCurrentStep(AppStep.STRATEGY);
  };

  const handleStrategyComplete = (trendData: TrendInsight[], matchData: CourseMatch[]) => {
    setTrends(trendData);
    setMatches(matchData);
    setCurrentStep(AppStep.PREVIEW);
  };

  const toggleView = () => {
    setView(prev => prev === 'wizard' ? 'agents' : 'wizard');
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
          <div className="flex items-center gap-4 text-sm">
             <button 
                onClick={toggleView}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${view === 'agents' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
             >
                <Settings size={16} />
                <span className="hidden sm:inline">에이전트 관리</span>
             </button>
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
                    />
                )}

                {currentStep === AppStep.STRATEGY && analysisResult && (
                    <ResearchAndMatching 
                    analysisData={analysisResult} 
                    onNext={handleStrategyComplete} 
                    agentConfigs={agentConfigs}
                    />
                )}

                {currentStep >= AppStep.PREVIEW && analysisResult && (
                    <ProposalPreview 
                    analysis={analysisResult}
                    trends={trends}
                    matches={matches}
                    agentConfigs={agentConfigs}
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