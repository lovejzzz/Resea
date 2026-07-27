export type UUID = string;
export type ReviewState =
  | "draft_model"
  | "draft_user"
  | "needs_evidence"
  | "needs_review"
  | "approved"
  | "rejected"
  | "blocked"
  | "superseded";

export type RiskTier = "general" | "consequential" | "high_stakes" | "regulated";
export type Severity = "critical" | "high" | "medium" | "advisory";

export interface CourseSpec {
  id: UUID;
  title: string;
  subject: string;
  catalogDescription?: string;
  rationale?: string;
  academicLevel: string;
  courseRole: string;
  learnerProfile: string;
  priorKnowledge: string;
  prerequisites: string;
  diagnosticPlan?: string;
  weeks: number;
  sessionsPerWeek: number;
  minutesPerSession: number;
  independentMinutesPerWeek: number;
  modality: string;
  enrollment: number;
  materialCostMax: number;
  openOnly: boolean;
  accessibilityTarget: string;
  accessibilityStatement?: string;
  academicIntegrityPolicy?: string;
  communicationPolicy?: string;
  requiredMaterials?: string[];
  riskTier: RiskTier;
  jurisdiction: string;
  reviewState: ReviewState;
}

export interface Assumption {
  id: UUID;
  statement: string;
  rationale: string;
  owner: string;
  confidence: "low" | "medium" | "high";
  status: "open" | "resolved";
}

export interface ResearchQuestion {
  id: UUID;
  family: string;
  question: string;
  rationale: string;
  priority: "core" | "supporting" | "optional";
  status: "proposed" | "approved" | "sufficient" | "gap";
  queries: string[];
}

export interface ResearchPlan {
  id: UUID;
  status: "draft" | "approved";
  questions: ResearchQuestion[];
  desiredSourceCategories: string[];
  inclusionRules: string[];
  stoppingConditions: string[];
  maxSources: number;
}

export interface Source {
  id: UUID;
  title: string;
  authors: string[];
  publisher: string;
  canonicalUrl: string;
  sourceType: string;
  publishedAt?: string;
  addedAt: string;
  access: "public" | "open_access" | "restricted" | "unknown";
  license: "public_domain" | "open_license" | "restricted" | "unknown";
  licenseLabel?: string;
  allowedActions: Array<"link" | "quote" | "retain_private" | "adapt" | "redistribute">;
  volatility: "stable" | "slow" | "moderate" | "fast" | "event_driven" | "user_managed";
  lastChecked: string;
  nextCheck: string;
  reviewState: ReviewState;
  researchQuestionIds: UUID[];
  score: number;
  rationale: string;
}

export interface EvidenceUnit {
  id: UUID;
  sourceId: UUID;
  locator: string;
  headingPath?: string[];
  exactText: string;
  annotation: string;
  claimTypes: string[];
  qualityFlags: string[];
  reviewState: ReviewState;
}

export interface Claim {
  id: UUID;
  type: "factual" | "procedural" | "prerequisite" | "pedagogical" | "instructor_decision";
  text: string;
  supportingEvidenceIds: UUID[];
  contradictingEvidenceIds: UUID[];
  inference: "direct" | "synthesis" | "pedagogical_inference" | "instructor_assertion";
  reviewState: ReviewState;
}

export interface Concept {
  id: UUID;
  label: string;
  definition: string;
  role: "core" | "supporting" | "optional";
  prerequisiteIds: UUID[];
  claimIds: UUID[];
  outcomeIds: UUID[];
  reviewState: ReviewState;
}

export interface LearningOutcome {
  id: UUID;
  code: string;
  action: string;
  object: string;
  conditions: string;
  criteria: string;
  conceptIds: UUID[];
  activityIds: UUID[];
  assessmentIds: UUID[];
  provenanceClaimIds: UUID[];
  reviewState: ReviewState;
}

export interface Activity {
  id: UUID;
  title: string;
  type: string;
  instructions: string;
  outcomeIds: UUID[];
  estimatedMinutes: number;
  feedback: string;
  accessibilityAlternatives: string[];
  preparation?: string;
  successIndicators?: string[];
}

export interface Assessment {
  id: UUID;
  title: string;
  type: string;
  stakes: "diagnostic" | "formative" | "summative";
  purpose?: string;
  task: string;
  outcomeIds: UUID[];
  expectedEvidence?: string[];
  estimatedMinutes: number;
  gradingMinutesPerStudent: number;
  rubricCriteria: string[];
  feedbackStrategy?: string;
  collaborationPolicy?: string;
  sourcePolicy?: string;
  toolPolicy: string;
  integrityNotes?: string;
  alignmentRationale?: string;
  evaluatorGuidance?: string;
  accessibilityAlternatives: string[];
}

export interface Module {
  id: UUID;
  order: number;
  title: string;
  summary: string;
  drivingQuestion?: string;
  outcomeIds: UUID[];
  conceptIds: UUID[];
  sourceIds: UUID[];
  activities: Activity[];
  assessments: Assessment[];
  misconceptions?: string[];
  connections?: string;
  instructorNotes?: string[];
  estimatedStudentMinutes: number;
  reviewState: ReviewState;
}

export interface AuditFinding {
  id: UUID;
  ruleId: string;
  category: string;
  checkerType: "deterministic" | "model_assisted" | "human";
  severity: Severity;
  title: string;
  description: string;
  objectIds: UUID[];
  remediation: string;
  status: "open" | "resolved" | "waived";
}

export interface CourseVersion {
  id: UUID;
  label: string;
  createdAt: string;
  approvedBy: string;
  releaseNotes: string;
  manifestHash: string;
  findingCount: number;
}

export interface AuditEvent {
  id: UUID;
  at: string;
  action: string;
  detail: string;
}

export interface ProjectState {
  schemaVersion: "1.0.0";
  id: UUID;
  title: string;
  createdAt: string;
  updatedAt: string;
  lifecycle: string;
  backupAt?: string;
  spec: CourseSpec;
  assumptions: Assumption[];
  researchPlan: ResearchPlan;
  sources: Source[];
  evidence: EvidenceUnit[];
  claims: Claim[];
  concepts: Concept[];
  outcomes: LearningOutcome[];
  modules: Module[];
  findings: AuditFinding[];
  versions: CourseVersion[];
  events: AuditEvent[];
}
