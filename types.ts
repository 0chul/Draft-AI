
export interface RFPMetadata {
  fileName: string;
  uploadDate: string;
  fileSize: string;
}

export interface AnalysisResult {
  programName: string;
  objectives: string[];
  targetAudience: string;
  schedule: string;
  modules: string[];
  specialRequests: string;
}

export interface TrendInsight {
  topic: string;
  insight: string;
  source: string;
  relevanceScore: number;
}

export interface CourseMatch {
  id: string;
  moduleName: string;
  courseTitle: string;
  instructor: string;
  matchReason: string;
  matchScore: number;
  isExternal: boolean;
}

export interface ProposalSlide {
  id: number;
  title: string;
  content: string;
  type: 'cover' | 'agenda' | 'overview' | 'trend' | 'curriculum' | 'instructor' | 'schedule' | 'closing';
}

export interface QualityAssessment {
  complianceScore: number;
  complianceReason: string;
  instructorExpertiseScore: number;
  instructorExpertiseReason: string;
  industryMatchScore: number;
  industryMatchReason: string;
  totalScore: number;
  overallComment: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  guardrails: string[];
}

export enum AppStep {
  UPLOAD = 1,
  ANALYSIS = 2,
  STRATEGY = 3,
  PREVIEW = 4,
  COMPLETE = 5
}
