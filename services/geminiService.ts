
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TrendInsight, CourseMatch, ProposalSlide, QualityAssessment } from "../types";

// Initialize Gemini Client
// NOTE: In a real production app, the API key should be handled securely via a backend proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Simulates analyzing an RFP document.
 */
export const analyzeRFP = async (fileName: string): Promise<AnalysisResult> => {
  // Simulate network/processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real scenario, we would send the file content to Gemini here.
  // For the demo, we return a high-quality mock based on the "Expert Consulting" context.
  return {
    programName: "2025년 차세대 리더십 역량 강화 과정",
    objectives: [
      "디지털 전환(DT) 시대에 맞는 리더십 함양",
      "데이터 기반 의사결정 능력 강화",
      "MZ세대 팀원과의 효과적인 소통 및 코칭 스킬 습득"
    ],
    targetAudience: "팀장급 및 예비 리더 30명",
    schedule: "2025년 5월 중 (2박 3일 집합 교육)",
    modules: [
      "DT 트렌드와 리더의 역할",
      "데이터 리터러시 워크숍",
      "세대 공감 커뮤니케이션 & 코칭"
    ],
    specialRequests: "실습 위주의 구성 요청, 최신 트렌드 사례 포함 필수"
  };
};

/**
 * Generates Trend Insights based on the analyzed modules.
 * Accepts an optional system prompt override.
 */
export const fetchTrendInsights = async (modules: string[], systemPrompt?: string): Promise<TrendInsight[]> => {
  if (!process.env.API_KEY) {
    // Fallback if no key provided
    return [
      { topic: "Digital Transformation", insight: "AI 도입 가속화에 따른 리더의 기술 이해도가 필수 역량으로 부상함.", source: "HBR 2024", relevanceScore: 95 },
      { topic: "Employee Experience (EX)", insight: "MZ세대 유지(Retention)를 위한 '성장 경험' 제공이 중요.", source: "Gartner HR Trends", relevanceScore: 88 },
      { topic: "Data Driven Decision", insight: "직관이 아닌 데이터에 기반한 의사결정 문화 확산.", source: "McKinsey", relevanceScore: 92 }
    ];
  }

  try {
    const basePrompt = `
      다음 교육 모듈 주제들에 대한 최신 HRD 및 비즈니스 트렌드 인사이트를 3가지 생성해줘.
      모듈: ${modules.join(", ")}
      
      응답은 JSON 포맷으로:
      [{ "topic": string, "insight": string, "source": string, "relevanceScore": number }]
    `;

    // If a system prompt is provided, we prepend it as a system instruction (or context)
    // Note: for 2.5-flash simple generateContent, we can include system instruction in config.
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            insight: { type: Type.STRING },
            source: { type: Type.STRING },
            relevanceScore: { type: Type.INTEGER },
          }
        }
      }
    };

    if (systemPrompt) {
      config.systemInstruction = systemPrompt;
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: basePrompt,
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as TrendInsight[];

  } catch (error) {
    console.error("Gemini Trend Error:", error);
    return [
      { topic: "Error", insight: "AI 연결 실패. 기본 트렌드 데이터를 표시합니다.", source: "System", relevanceScore: 0 }
    ];
  }
};

/**
 * Matches internal curriculum to the requirements.
 * Accepts trends to better inform the strategy.
 */
export const matchCurriculum = async (modules: string[], trends: TrendInsight[], systemPrompt?: string): Promise<CourseMatch[]> => {
  if (!process.env.API_KEY) {
    // Fallback data
    return modules.map((mod, idx) => ({
      id: `course-${idx}`,
      moduleName: mod,
      courseTitle: `Expert ${mod} 마스터 클래스`,
      instructor: idx % 2 === 0 ? "김철수 수석" : "이영희 이사",
      matchReason: `트렌드 분석 결과(${trends[0]?.topic || '최신 동향'})를 반영하여 해당 모듈을 선정했습니다. 키워드 매칭률 95%.`,
      matchScore: 90 + Math.floor(Math.random() * 10),
      isExternal: false
    }));
  }

  try {
    // Simplify trends for the prompt
    const trendSummary = trends.map(t => `${t.topic}: ${t.insight}`).join("; ");

    const basePrompt = `
      다음 RFP 요구 모듈에 대해 가장 적합한 가상의 내부 교육 과정과 강사를 매칭하고 이유를 설명해주세요.
      전략 수립 시, 사전에 분석된 트렌드 인사이트를 참고하여 매칭 이유를 강화해주세요.
      
      요구 모듈: ${modules.join(", ")}
      참고 트렌드: ${trendSummary}
      
      응답 JSON 포맷:
      [{ "id": string, "moduleName": string, "courseTitle": string, "instructor": string, "matchReason": string, "matchScore": number, "isExternal": boolean }]
      
      (참고: id는 unique string, matchScore는 0-100, isExternal은 false로 설정)
    `;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            moduleName: { type: Type.STRING },
            courseTitle: { type: Type.STRING },
            instructor: { type: Type.STRING },
            matchReason: { type: Type.STRING },
            matchScore: { type: Type.INTEGER },
            isExternal: { type: Type.BOOLEAN },
          }
        }
      }
    };

    if (systemPrompt) {
       config.systemInstruction = systemPrompt;
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: basePrompt,
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as CourseMatch[];

  } catch (error) {
    console.error("Gemini Match Error:", error);
    return [];
  }
};

/**
 * Generates slide content text based on structured data.
 */
export const generateProposalContent = async (analysis: AnalysisResult, trends: TrendInsight[], matches: CourseMatch[]): Promise<ProposalSlide[]> => {
    // Simulating slide generation logic
    const slides: ProposalSlide[] = [
      { id: 1, title: analysis.programName, content: "제안서\n\n귀사의 성공적인 리더 육성을 위한 제안", type: "cover" },
      { id: 2, title: "제안 배경 및 목적", content: `본 과정은 ${analysis.targetAudience}을 대상으로 합니다.\n주요 목표:\n${analysis.objectives.map(o => "- " + o).join("\n")}`, type: "overview" },
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

    slides.push({ id: 99, title: "추진 일정", content: `${analysis.schedule} 진행 예정\n\n사전 진단 -> 본 교육 -> 사후 팔로우업`, type: "schedule" });
    slides.push({ id: 100, title: "감사합니다", content: "엑스퍼트컨설팅\n문의: 02-1234-5678", type: "closing" });

    return slides;
};

/**
 * Evaluates the proposal quality based on requirements and content.
 */
export const evaluateProposalQuality = async (
  analysis: AnalysisResult, 
  matches: CourseMatch[], 
  systemPrompt?: string
): Promise<QualityAssessment> => {
  if (!process.env.API_KEY) {
    return {
      complianceScore: 92,
      complianceReason: "RFP에 명시된 교육 모듈 3가지를 모두 포함하고 있으며 일정과 대상도 정확히 반영됨.",
      instructorExpertiseScore: 88,
      instructorExpertiseReason: "추천된 강사진의 이력이 요구 주제와 잘 매칭되나, 일부 심화 주제는 외부 전문가 고려 필요.",
      industryMatchScore: 85,
      industryMatchReason: "제안된 사례가 해당 산업군(IT/Tech)에 적합하나, 조금 더 특화된 케이스 스터디 보강 권장.",
      totalScore: 89,
      overallComment: "전반적으로 우수한 제안서입니다. 트렌드 섹션을 조금 더 보강하면 수주 확률이 높아질 것입니다."
    };
  }

  try {
    const basePrompt = `
      Evaluate the following proposal data against the requirements.
      
      Requirements: ${JSON.stringify(analysis)}
      Matched Courses: ${JSON.stringify(matches)}

      Evaluate on 3 criteria and return in JSON format:
      1. Compliance Score (0-100) & Reason: adherence to RFP objectives and modules.
      2. Instructor Expertise Score (0-100) & Reason: relevance of selected courses/instructors.
      3. Industry Match Score (0-100) & Reason: suitability for target audience.
      4. Total Score & Overall Comment.
    `;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          complianceScore: { type: Type.INTEGER },
          complianceReason: { type: Type.STRING },
          instructorExpertiseScore: { type: Type.INTEGER },
          instructorExpertiseReason: { type: Type.STRING },
          industryMatchScore: { type: Type.INTEGER },
          industryMatchReason: { type: Type.STRING },
          totalScore: { type: Type.INTEGER },
          overallComment: { type: Type.STRING },
        }
      }
    };

    if (systemPrompt) {
      config.systemInstruction = systemPrompt;
    }

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: basePrompt,
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as QualityAssessment;

  } catch (error) {
    console.error("Gemini QA Error:", error);
    return {
      complianceScore: 0,
      complianceReason: "Evaluation Failed",
      instructorExpertiseScore: 0,
      instructorExpertiseReason: "Evaluation Failed",
      industryMatchScore: 0,
      industryMatchReason: "Evaluation Failed",
      totalScore: 0,
      overallComment: "AI service unavailable."
    };
  }
};
