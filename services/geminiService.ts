
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, TrendInsight, CourseMatch, ProposalSlide, QualityAssessment, PastProposal, StrategyOption } from "../types";

const DEFAULT_MODEL = "gemini-2.5-flash";

// Helper to get AI instance
const getAI = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

// Helper to clean JSON string
const cleanJsonString = (text: string): string => {
  if (!text) return "";
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  return cleaned.trim();
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulates analyzing an RFP document with 8s delay and dummy data.
 */
export const analyzeRFP = async (
  fileName: string, 
  systemPrompt?: string, 
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<AnalysisResult> => {
  console.log("Agent: RFP Analyst started...");
  
  // Simulate 8 second agent processing delay
  await delay(8000);

  // Return realistic dummy data
  return {
    clientName: "FutureTech Corp",
    industry: "IT / Software Service",
    department: "인재개발실(HRD)",
    programName: "2025 AI 기반 차세대 리더십 혁신 과정",
    objectives: [
      "AI 기술 도입에 따른 중간관리자 리더십 역량 재정의",
      "데이터 기반의 의사결정 및 성과 관리 프로세스 확립",
      "애자일(Agile) 조직 문화 확산을 위한 소통 방식 개선"
    ],
    targetAudience: "팀장 및 PM 그룹 (약 50명)",
    schedule: "2025년 6월 ~ 7월 (총 4차수 진행)",
    location: "FutureTech 판교 캠퍼스 대강당",
    modules: [
      "AI Era Leadership Paradigm",
      "Data-Driven Decision Making",
      "Agile Communication & Coaching"
    ],
    specialRequests: "이론보다는 현업 사례(Case Study) 위주의 워크숍 형태 선호, 생성형 AI 실습 도구 활용 필수."
  };
};

/**
 * Generates Trend Insights with 8s delay and dummy data.
 */
export const fetchTrendInsights = async (
  modules: string[], 
  systemPrompt?: string, 
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<TrendInsight[]> => {
  console.log("Agent: Trend Researcher started...");
  
  // Simulate 8 second agent processing delay
  await delay(8000);

  return [
    { 
      topic: "Generative AI in Leadership", 
      insight: "리더가 AI를 '도구'가 아닌 '협업 파트너'로 인식할 때 팀 생산성이 40% 이상 향상됨.", 
      source: "Gartner 2024 HR Tech Trends", 
      relevanceScore: 95 
    },
    { 
      topic: "Data Fluency", 
      insight: "직관에 의존하던 리더십에서 데이터 스토리텔링을 통한 설득적 리더십으로의 전환이 가속화.", 
      source: "HBR (Harvard Business Review)", 
      relevanceScore: 88 
    },
    { 
      topic: "Hybrid Work Agility", 
      insight: "비대면/대면 하이브리드 환경에서의 심리적 안전감(Psychological Safety) 조성이 핵심 과제.", 
      source: "McKinsey Report 2024", 
      relevanceScore: 92 
    }
  ];
};

/**
 * Generates Strategic Options with QA Feedback with 8s delay and dummy data.
 */
export const generateStrategies = async (
  analysis: AnalysisResult,
  trends: TrendInsight[],
  systemPrompt?: string,
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<StrategyOption[]> => {
  console.log("Agent: Strategy Planner started...");
  
  // Simulate 8 second agent processing delay
  await delay(8000);

  return [
    {
      id: "strat-1",
      title: "Data-Driven Innovation",
      description: "데이터 분석과 AI 도구 활용 능력 배양에 집중하여 실질적인 비즈니스 성과 창출을 목표로 하는 전략입니다.",
      keywords: ["Data Fluency", "AI Tools", "ROI Focus"],
      rationale: "고객사의 '데이터 기반 의사결정' 목표와 가장 부합하며, 성과 측정(ROI)이 용이한 구조입니다.",
      qaScore: 95,
      qaAdvice: "RFP의 핵심 요구사항을 완벽하게 충족합니다. 다만, 인문학적 리더십 요소가 부족하지 않도록 보완이 필요합니다."
    },
    {
      id: "strat-2",
      title: "Agile Culture Transformation",
      description: "조직 내 소통 방식과 협업 문화를 개선하여 민첩한(Agile) 조직으로의 변화를 유도하는 소프트 스킬 중심 전략입니다.",
      keywords: ["Psychological Safety", "Coaching", "Collaboration"],
      rationale: "최근 조직 문화 트렌드인 '심리적 안전감'을 강조하여 팀장들의 코칭 역량을 극대화합니다.",
      qaScore: 88,
      qaAdvice: "문화 개선 측면에서는 훌륭하나, RFP에서 강조된 'AI/데이터' 실습 비중이 다소 낮아질 우려가 있습니다."
    },
    {
      id: "strat-3",
      title: "Hybrid Leadership Blended",
      description: "온라인 사전 학습(플립 러닝)과 오프라인 워크숍을 결합하여 효율성을 극대화한 하이브리드 학습 모델입니다.",
      keywords: ["Flipped Learning", "Workshop", "Networking"],
      rationale: "짧은 일정 내에 교육 효과를 높이기 위해 이론은 온라인으로, 실습은 현장에서 집중적으로 진행합니다.",
      qaScore: 90,
      qaAdvice: "학습 효율성이 높은 전략입니다. 사전 학습 참여율을 높일 수 있는 구체적인 Gamification 방안이 추가되면 좋습니다."
    }
  ];
};

/**
 * Matches internal curriculum with 8s delay and dummy data.
 */
export const matchCurriculum = async (
  modules: string[], 
  trends: TrendInsight[], 
  systemPrompt?: string, 
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<CourseMatch[]> => {
  console.log("Agent: Curriculum Matcher started...");

  // Simulate 8 second agent processing delay
  await delay(8000);

  return [
    {
      id: "course-001",
      moduleName: "AI Era Leadership Paradigm",
      courseTitle: "Digital Transformaton 리더십 마스터",
      instructor: "김철수 수석",
      matchReason: "Gartner 트렌드에서 강조된 'AI 협업 파트너십' 개념을 가장 잘 다루는 내부 과정입니다. 김철수 수석의 DT 프로젝트 경험이 풍부합니다.",
      matchScore: 96,
      isExternal: false
    },
    {
      id: "course-002",
      moduleName: "Data-Driven Decision Making",
      courseTitle: "실무 데이터를 활용한 비즈니스 인사이트",
      instructor: "이영희 이사",
      matchReason: "고객사가 요청한 '데이터 기반 의사결정' 목표와 100% 일치하며, 실제 데이터를 활용한 워크숍 진행이 가능합니다.",
      matchScore: 94,
      isExternal: false
    },
    {
      id: "course-003",
      moduleName: "Agile Communication & Coaching",
      courseTitle: "MZ세대와 통하는 애자일 코칭 스킬",
      instructor: "박민수 전문위원",
      matchReason: "하이브리드 환경에서의 소통 이슈를 해결하기 위한 '심리적 안전감' 모듈이 포함되어 있어 트렌드 적합성이 높습니다.",
      matchScore: 89,
      isExternal: false
    }
  ];
};

/**
 * Generates slide content text based on structured data.
 */
export const generateProposalContent = async (analysis: AnalysisResult, trends: TrendInsight[], matches: CourseMatch[], apiKey?: string): Promise<ProposalSlide[]> => {
    // This step is usually purely algorithmic assembly, but we'll leave it as is.
    
    const slides: ProposalSlide[] = [
      { id: 1, title: analysis.programName, content: `제안서\n\n${analysis.clientName} 귀중\n성공적인 리더 육성을 위한 제안`, type: "cover" },
      { id: 2, title: "제안 배경 및 목적", content: `본 과정은 ${analysis.clientName} ${analysis.department}의 ${analysis.targetAudience}을 대상으로 합니다.\n주요 목표:\n${analysis.objectives.map(o => "- " + o).join("\n")}`, type: "overview" },
      { id: 3, title: "최신 트렌드 인사이트", content: trends.map(t => `[${t.topic}] ${t.insight} (출처: ${t.source})`).join("\n\n"), type: "trend" },
    ];

    matches.forEach((match, idx) => {
        slides.push({
            id: 4 + idx,
            title: `Module ${idx + 1}: ${match.courseTitle}`,
            content: `강사: ${match.instructor}\n\n매칭 포인트:\n${match.matchReason}\n\n이 모듈은 고객사의 요청인 '${match.moduleName}'을 완벽하게 커버합니다.`,
            type: "curriculum"
        });
    });

    slides.push({ id: 99, title: "추진 일정 및 장소", content: `${analysis.schedule} 진행 예정\n장소: ${analysis.location}\n\n사전 진단 -> 본 교육 -> 사후 팔로우업`, type: "schedule" });
    slides.push({ id: 100, title: "감사합니다", content: "엑스퍼트컨설팅\n문의: 02-1234-5678", type: "closing" });

    return slides;
};

/**
 * Evaluates the proposal quality with 8s delay and dummy data.
 */
export const evaluateProposalQuality = async (
  analysis: AnalysisResult, 
  matches: CourseMatch[], 
  systemPrompt?: string,
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<QualityAssessment> => {
  console.log("Agent: QA Agent started...");

  // Simulate 8 second agent processing delay
  await delay(8000);

  return {
    complianceScore: 98,
    complianceReason: "RFP에 명시된 3가지 핵심 모듈(리더십, 데이터, 애자일)이 제안서에 빠짐없이 반영되었습니다. 일정과 대상도 정확하게 일치합니다.",
    instructorExpertiseScore: 92,
    instructorExpertiseReason: "배정된 강사진(김철수, 이영희, 박민수)은 모두 해당 분야 10년 이상의 경력을 보유하여 전문성이 매우 높습니다.",
    industryMatchScore: 95,
    industryMatchReason: "IT/소프트웨어 산업군의 빠른 변화 속도를 고려한 '애자일' 및 'AI' 테마가 적절히 녹아들어 있습니다.",
    totalScore: 95,
    overallComment: "매우 완성도 높은 제안서입니다. 고객사의 니즈인 '실습 위주'와 '최신 트렌드'가 완벽하게 조화를 이루고 있어 수주 가능성이 매우 높습니다.",
    assessmentDate: new Date().toISOString()
  };
};

/**
 * Evaluates a past proposal based on limited metadata.
 */
export const evaluatePastProposal = async (
  proposal: PastProposal,
  systemPrompt?: string,
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<QualityAssessment> => {
  console.log("Agent: Past Proposal Auditor started...");

  // Simulate 8 second delay for consistency
  await delay(8000);

  return {
    complianceScore: 89,
    complianceReason: "과거 데이터를 분석한 결과, 고객의 요구사항을 충실히 이행한 표준적인 제안서입니다.",
    instructorExpertiseScore: 85,
    instructorExpertiseReason: "해당 산업군 전문 강사진이 투입되었으며, 강사 만족도가 높았던 프로젝트입니다.",
    industryMatchScore: 90,
    industryMatchReason: `${proposal.industry} 분야의 특성을 잘 파악한 커리큘럼 구성이 돋보입니다.`,
    totalScore: 88,
    overallComment: "안정적인 수주가 예상되는 우수한 품질의 제안서입니다.",
    assessmentDate: new Date().toISOString()
  };
};
