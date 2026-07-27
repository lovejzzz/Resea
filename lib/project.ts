import { sampleProject } from "./fixture";
import type { ProjectState } from "./types";
import { isoNow, uid } from "./utils";

export function cloneSample(): ProjectState {
  return structuredClone(sampleProject);
}

export function createSampleProject(): ProjectState {
  const next = cloneSample();
  const createdAt = isoNow();
  next.id = uid("project");
  next.createdAt = createdAt;
  next.updatedAt = createdAt;
  next.backupAt = undefined;
  next.versions = [];
  next.events = [
    {
      id: uid("event"),
      at: createdAt,
      action: "Sample course loaded",
      detail: "Created a new browser-local working copy of the packaged sample.",
    },
  ];
  return next;
}

export function createBlankProject(): ProjectState {
  const createdAt = isoNow();
  const id = uid("project");
  return {
    schemaVersion: "1.0.0",
    id,
    title: "Untitled course",
    createdAt,
    updatedAt: createdAt,
    lifecycle: "BRIEF_DRAFT",
    spec: {
      id: uid("spec"),
      title: "Untitled course",
      subject: "",
      academicLevel: "Lower undergraduate",
      courseRole: "Elective",
      learnerProfile: "",
      priorKnowledge: "",
      prerequisites: "To be researched",
      weeks: 14,
      sessionsPerWeek: 2,
      minutesPerSession: 75,
      independentMinutesPerWeek: 240,
      modality: "In person",
      enrollment: 24,
      materialCostMax: 0,
      openOnly: true,
      accessibilityTarget: "WCAG 2.2 AA",
      riskTier: "general",
      jurisdiction: "United States higher education",
      reviewState: "draft_user",
    },
    assumptions: [
      {
        id: uid("assumption"),
        statement: "Learner entry knowledge has not yet been confirmed.",
        rationale: "The course brief does not yet establish prerequisite evidence.",
        owner: "Instructor",
        confidence: "low",
        status: "open",
      },
    ],
    researchPlan: {
      id: uid("plan"),
      status: "draft",
      questions: [],
      desiredSourceCategories: [],
      inclusionRules: [],
      stoppingConditions: [],
      maxSources: 25,
    },
    sources: [],
    evidence: [],
    claims: [],
    concepts: [],
    outcomes: [],
    modules: [],
    findings: [],
    versions: [],
    events: [
      {
        id: uid("event"),
        at: createdAt,
        action: "Project created",
        detail: "Created a browser-local project with no remote account.",
      },
    ],
  };
}
