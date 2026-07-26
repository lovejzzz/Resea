import type { CourseSpec, ResearchPlan, Source } from "./types";
import { addDays, isoNow, uid } from "./utils";

const families = [
  {
    family: "Program context",
    question: (spec: CourseSpec) =>
      `What role does a ${spec.academicLevel.toLowerCase()} course in ${spec.subject} usually play?`,
    rationale: "Tests the proposed scope against comparable program contexts.",
  },
  {
    family: "Canonical coverage",
    question: (spec: CourseSpec) =>
      `Which concepts and practices recur across authoritative sources for ${spec.subject}?`,
    rationale: "Builds coverage from several source classes rather than one outline.",
  },
  {
    family: "Prerequisites",
    question: (spec: CourseSpec) =>
      `What knowledge and skills do learners need before studying ${spec.subject}?`,
    rationale: "Makes entry assumptions visible and supports a diagnostic plan.",
  },
  {
    family: "Assessment",
    question: (spec: CourseSpec) =>
      `What evidence would validly demonstrate undergraduate capability in ${spec.subject}?`,
    rationale: "Establishes assessment evidence before weekly scheduling.",
  },
  {
    family: "Access and inclusion",
    question: (spec: CourseSpec) =>
      `Which access, cost, modality, and accessibility barriers matter for learning ${spec.subject}?`,
    rationale: "Treats access as a design constraint.",
  },
];

export function createResearchPlan(spec: CourseSpec): ResearchPlan {
  return {
    id: uid("plan"),
    status: "draft",
    desiredSourceCategories: [
      "Official / normative",
      "Primary",
      "Scholarly synthesis",
      "Curricular / OER",
      "Pedagogical",
    ],
    inclusionRules: [
      "Prefer sources with stable authorship, date, and version metadata",
      "Seek an accessible or open alternative for required materials",
      "Retain exact evidence and locator before constructing claims",
    ],
    stoppingConditions: [
      "Every approved outcome has evidence coverage",
      "Every core concept has at least one appropriate source",
      "Source diversity and freshness gaps are reviewed",
      "The instructor approves remaining limitations",
    ],
    maxSources: 25,
    questions: families.map((item, index) => {
      const question = item.question(spec);
      return {
        id: uid("rq"),
        family: item.family,
        question,
        rationale: item.rationale,
        priority: index < 4 ? "core" : "supporting",
        status: "proposed",
        queries: [
          `"${spec.subject}" ${item.family.toLowerCase()} ${spec.academicLevel.toLowerCase()}`,
          `${spec.subject} ${item.family.toLowerCase()} university open access`,
        ],
      };
    }),
  };
}

interface OpenAlexWork {
  id: string;
  title: string;
  doi: string | null;
  publication_year: number | null;
  primary_location: {
    landing_page_url: string | null;
    source: { display_name: string } | null;
    is_oa: boolean;
  } | null;
  open_access: { is_oa: boolean; oa_status: string };
  authorships: Array<{ author: { display_name: string } }>;
  type_crossref: string;
  cited_by_count: number;
}

export async function searchOpenAlex(query: string, signal?: AbortSignal): Promise<Source[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("per-page", "8");
  url.searchParams.set(
    "select",
    "id,title,doi,publication_year,primary_location,open_access,authorships,type_crossref,cited_by_count",
  );
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`OpenAlex returned ${response.status}`);
  const data = (await response.json()) as { results: OpenAlexWork[] };
  const today = isoNow().slice(0, 10);
  return data.results
    .filter((work) => work.title && (work.doi || work.primary_location?.landing_page_url))
    .map((work) => {
      const access = work.open_access?.is_oa ? "open_access" : "unknown";
      const citationsSignal = Math.min(1, Math.log10(work.cited_by_count + 1) / 3);
      const yearSignal = work.publication_year
        ? Math.max(0, 1 - (new Date().getUTCFullYear() - work.publication_year) / 30)
        : 0.35;
      const score = Math.round((0.5 + citationsSignal * 0.3 + yearSignal * 0.2) * 100);
      return {
        id: uid("source"),
        title: work.title,
        authors: work.authorships.slice(0, 6).map((item) => item.author.display_name),
        publisher: work.primary_location?.source?.display_name ?? "Publisher not identified",
        canonicalUrl: work.doi ?? work.primary_location?.landing_page_url ?? work.id,
        sourceType: work.type_crossref || "scholarly work",
        publishedAt: work.publication_year ? `${work.publication_year}-01-01` : undefined,
        addedAt: isoNow(),
        access,
        license: "unknown",
        allowedActions: ["link"],
        volatility: "slow",
        lastChecked: today,
        nextCheck: addDays(today, 180),
        reviewState: "needs_review",
        researchQuestionIds: [],
        score,
        rationale:
          "Scholarly metadata from OpenAlex. Authority, scope, full text, and license still require instructor review.",
      } satisfies Source;
    });
}

export function safeResearchUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Only HTTPS sources are accepted.");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\.|^10\.|^192\.168\.|^169\.254\./.test(host)
  ) {
    throw new Error("Local and private-network sources are blocked.");
  }
  return url.toString();
}
