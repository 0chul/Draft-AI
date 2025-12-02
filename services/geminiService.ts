import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, TrendInsight, CourseMatch, ProposalSlide, QualityAssessment, PastProposal } from "../types";

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
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  return cleaned.trim();
};

// Helper for generating content with fallback logic
const generateWithFallback = async (
  ai: GoogleGenAI, 
  primaryModel: string | undefined, 
  fallbackModel: string | undefined, 
  contents: string, 
  config: any
): Promise<GenerateContentResponse> => {
  const modelToUse = primaryModel || fallbackModel || DEFAULT_MODEL;

  try {
    return await ai.models.generateContent({
      model: modelToUse,
      contents,
      config
    });
  } catch (error) {
    // If we have a fallback and the primary model failed (and it wasn't the fallback already)
    if (primaryModel && fallbackModel && primaryModel !== fallbackModel) {
      console.warn(`Primary model ${primaryModel} failed. Retrying with fallback model ${fallbackModel}.`, error);
      return await ai.models.generateContent({
        model: fallbackModel,
        contents,
        config
      });
    }
    throw error;
  }
};

/**
 * Simulates analyzing an RFP document.
 */
export const analyzeRFP = async (
  fileName: string, 
  systemPrompt?: string, 
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<AnalysisResult> => {
  const ai = getAI(apiKey);

  // If no API key is present, return the dynamic mock data
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fallback logic based on filename for demo purposes
    const isTech = fileName.includes("AI") || fileName.includes("데이터") || fileName.includes("DT");
    const isBank = fileName.includes("금융") || fileName.includes("은행");
    
    return {
      clientName: isBank ? "한국미래은행" : (isTech ? "테크솔루션즈" : "대한제조(주)"),
      industry: isBank ? "금융/은행" : (isTech ? "IT/소프트웨어" : "제조/화학"),
      department: "인재개발팀",
      programName: fileName.replace(".pdf", "").replace(".pptx", "") || "2025년 차세대 리더십 과정",
      objectives: [
        "디지털 전환(DT) 시대에 맞는 리더십 함양",
        "데이터 기반 의사결정 능력 강화",
        "MZ세대 팀원과의 효과적인 소통 및 코칭 스킬 습득"
      ],
      targetAudience: "팀장급 및 예비 리더 30명",
      schedule: "2025년 5월 중 (2박 3일 집합 교육)",
      location: "용인 엑스퍼트 연수원",
      modules: [
        "DT 트렌드와 리더의 역할",
        "데이터 리터러시 워크숍",
        "세대 공감 커뮤니케이션 & 코칭"
      ],
      specialRequests: "실습 위주의 구성 요청, 최신 트렌드 사례 포함 필수"
    };
  }

  try {
    const prompt = `
      Analyze the RFP file named "${fileName}". 
      Since I cannot upload the actual PDF content in this demo, please hallucinate a realistic RFP content based on the filename.
      Infer the industry, typical objectives for such a file name, and likely modules.
      
      **CRITICAL: Provide a concise summary. Do not generate lengthy descriptions or filler text. Keep strings under 200 characters where possible.**
      
      Return the result in JSON format matching this schema:
      {
        clientName: string,
        industry: string,
        department: string,
        programName: string,
        objectives: string[],
        targetAudience: string,
        schedule: string,
        location: string,
        modules: string[],
        specialRequests: string
      }
    `;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clientName: { type: Type.STRING },
          industry: { type: Type.STRING },
          department: { type: Type.STRING },
          programName: { type: Type.STRING },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING },
          schedule: { type: Type.STRING },
          location: { type: Type.STRING },
          modules: { type: Type.ARRAY, items: { type: Type.STRING } },
          specialRequests: { type: Type.STRING },
        }
      }
    };

    if (systemPrompt) {
      config.systemInstruction = systemPrompt;
    }

    const response = await generateWithFallback(ai, model, fallbackModel, prompt, config);

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJsonString(text)) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return error fallback
    return {
      clientName: "Error",
      industry: "Unknown",
      department: "Unknown",
      programName: "Analysis Failed",
      objectives: ["Error analyzing file"],
      targetAudience: "-",
      schedule: "-",
      location: "-",
      modules: [],
      specialRequests: "API Error"
    };
  }
};

/**
 * Generates Trend Insights based on the analyzed modules.
 */
export const fetchTrendInsights = async (
  modules: string[], 
  systemPrompt?: string, 
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<TrendInsight[]> => {
  const ai = getAI(apiKey);

  if (!ai) {
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

    const response = await generateWithFallback(ai, model, fallbackModel, basePrompt, config);

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJsonString(text)) as TrendInsight[];

  } catch (error) {
    console.error("Gemini Trend Error:", error);
    return [
      { topic: "Error", insight: "AI 연결 실패. 기본 트렌드 데이터를 표시합니다.", source: "System", relevanceScore: 0 }
    ];
  }
};

/**
 * Matches internal curriculum to the requirements.
 */
export const matchCurriculum = async (
  modules: string[], 
  trends: TrendInsight[], 
  systemPrompt?: string, 
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<CourseMatch[]> => {
  const ai = getAI(apiKey);

  if (!ai) {
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
      
      **중요: 'matchReason'은 100자 이내로 간결하게 작성하세요. 너무 긴 응답은 피하세요.**
      
      응답 JSON 포맷:
      [{ "id": string, "moduleName": string, "courseTitle": string, "instructor": string, "matchReason": string, "matchScore": number, "isExternal": boolean }]
      
      (참고: id는 unique string, matchScore는 0-100, isExternal은 false로 설정)
    `;

    const config: any = {
      responseMimeType: "application/json",
      maxOutputTokens: 4000, // Prevent runaway generation
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

    const response = await generateWithFallback(ai, model, fallbackModel, basePrompt, config);

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJsonString(text)) as CourseMatch[];

  } catch (error) {
    console.error("Gemini Match Error:", error);
    return [];
  }
};

/**
 * Generates slide content text based on structured data.
 */
export const generateProposalContent = async (analysis: AnalysisResult, trends: TrendInsight[], matches: CourseMatch[], apiKey?: string): Promise<ProposalSlide[]> => {
    // Simulating slide generation logic - this is mostly deterministic templating, 
    // but in a real app, you might use LLM to write the specific copy.
    // For now, we just return the template filled with data.
    
    // NOTE: You could add LLM calls here using getAI(apiKey) if you want the 'Proposal Assembly Agent' to actually write copy.
    
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
 * Evaluates the proposal quality based on requirements and content.
 */
export const evaluateProposalQuality = async (
  analysis: AnalysisResult, 
  matches: CourseMatch[], 
  systemPrompt?: string,
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<QualityAssessment> => {
  const ai = getAI(apiKey);

  if (!ai) {
    return {
      complianceScore: 92,
      complianceReason: "RFP에 명시된 교육 모듈 3가지를 모두 포함하고 있으며 일정과 대상도 정확히 반영됨.",
      instructorExpertiseScore: 88,
      instructorExpertiseReason: "추천된 강사진의 이력이 요구 주제와 잘 매칭되나, 일부 심화 주제는 외부 전문가 고려 필요.",
      industryMatchScore: 85,
      industryMatchReason: "제안된 사례가 해당 산업군에 적합하나, 조금 더 특화된 케이스 스터디 보강 권장.",
      totalScore: 89,
      overallComment: "전반적으로 우수한 제안서입니다. 트렌드 섹션을 조금 더 보강하면 수주 확률이 높아질 것입니다.",
      assessmentDate: new Date().toISOString()
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

    const response = await generateWithFallback(ai, model, fallbackModel, basePrompt, config);

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(cleanJsonString(text)) as QualityAssessment;
    return { ...result, assessmentDate: new Date().toISOString() };

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
      overallComment: "AI service unavailable.",
      assessmentDate: new Date().toISOString()
    };
  }
};

/**
 * Evaluates a past proposal based on limited metadata.
 * Simulates content understanding for the demo.
 */
export const evaluatePastProposal = async (
  proposal: PastProposal,
  systemPrompt?: string,
  apiKey?: string,
  model?: string,
  fallbackModel?: string
): Promise<QualityAssessment> => {
  const ai = getAI(apiKey);

  if (!ai) {
    // Fallback Mock Evaluation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      complianceScore: 85 + Math.floor(Math.random() * 10),
      complianceReason: "과거 제안 이력을 분석한 결과, 고객사 요구사항을 충실히 반영한 것으로 추정됩니다.",
      instructorExpertiseScore: 80 + Math.floor(Math.random() * 15),
      instructorExpertiseReason: "해당 산업군 전문 강사진이 투입되었으나, 최신 기술 트렌드 반영도는 보통입니다.",
      industryMatchScore: 90 + Math.floor(Math.random() * 8),
      industryMatchReason: `${proposal.industry} 분야의 특성을 잘 파악한 커리큘럼 구성이 돋보입니다.`,
      totalScore: 88,
      overallComment: "안정적인 수주가 예상되는 우수한 품질의 제안서입니다. 추후 유사 제안 시 참고 가치가 높습니다.",
      assessmentDate: new Date().toISOString()
    };
  }

  try {
    const basePrompt = `
      You are a Quality Assurance Auditor for past proposals.
      Based on the metadata provided below, assume the content of the proposal and provide a realistic quality assessment.
      
      Proposal Metadata:
      - Title: ${proposal.title}
      - Client: ${proposal.clientName}
      - Industry: ${proposal.industry}
      - Tags: ${proposal.tags.join(', ')}
      - Date: ${proposal.date}
      - Status: ${proposal.status}

      Evaluate on 3 criteria and return in JSON format:
      1. Compliance Score (0-100) & Reason: adherence to implied client needs.
      2. Instructor Expertise Score (0-100) & Reason: inferred suitability of expertise based on tags.
      3. Industry Match Score (0-100) & Reason: relevance to the ${proposal.industry} industry.
      4. Total Score (0-100) & Overall Comment.

      Make the comments sound professional and specific to the metadata.
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

    const response = await generateWithFallback(ai, model, fallbackModel, basePrompt, config);

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(cleanJsonString(text)) as QualityAssessment;
    return { ...result, assessmentDate: new Date().toISOString() };

  } catch (error) {
    console.error("Gemini Past Proposal QA Error:", error);
    return {
      complianceScore: 0,
      complianceReason: "Evaluation Failed",
      instructorExpertiseScore: 0,
      instructorExpertiseReason: "Evaluation Failed",
      industryMatchScore: 0,
      industryMatchReason: "Evaluation Failed",
      totalScore: 0,
      overallComment: "AI service unavailable.",
      assessmentDate: new Date().toISOString()
    };
  }
};