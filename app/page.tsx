"use client";

import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  CloudOff,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  FlaskConical,
  FolderOpen,
  GitBranch,
  GraduationCap,
  HardDrive,
  History,
  LayoutList,
  Library,
  Link2,
  Loader2,
  LockKeyhole,
  Menu,
  Network,
  PanelRightClose,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { evaluateOutputQuality, OUTPUT_RENDERER_VERSION } from "@/lib/artifacts";
import { alignmentMetrics, auditSummary, runAudit } from "@/lib/audit";
import { exportProject, importProjectFile } from "@/lib/export";
import { cloneSample, createBlankProject, createSampleProject } from "@/lib/project";
import { createResearchPlan, safeResearchUrl, searchOpenAlex } from "@/lib/research";
import { listProjects, loadProject, requestDurableStorage, saveProject, storageEstimate } from "@/lib/storage";
import type {
  Activity,
  Assessment,
  AuditFinding,
  CourseSpec,
  ProjectState,
  Source,
} from "@/lib/types";
import { addDays, formatDate, isoNow, sha256, sourceDomain, uid } from "@/lib/utils";

type Icon = LucideIcon;
type ViewId =
  | "brief"
  | "research"
  | "evidence"
  | "map"
  | "build"
  | "audit"
  | "refresh"
  | "versions";

const navItems: Array<{ id: ViewId; label: string; icon: Icon }> = [
  { id: "brief", label: "Brief", icon: ClipboardCheck },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "evidence", label: "Evidence", icon: Library },
  { id: "map", label: "Map", icon: Network },
  { id: "build", label: "Build", icon: LayoutList },
  { id: "audit", label: "Audit", icon: ShieldCheck },
  { id: "refresh", label: "Refresh", icon: RefreshCw },
  { id: "versions", label: "Versions", icon: History },
];

function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "warn" | "danger" | "blue";
  children: React.ReactNode;
}) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: Icon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={20} aria-hidden /></span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="section-description">{description}</p>
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </header>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="metric-bar">
      <div className="metric-row"><span>{label}</span><strong>{value}%</strong></div>
      <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function BriefView({
  project,
  updateSpec,
  approveBrief,
}: {
  project: ProjectState;
  updateSpec: (patch: Partial<CourseSpec>) => void;
  approveBrief: () => void;
}) {
  const { spec } = project;
  const required = [
    ["Course title", spec.title && spec.title !== "Untitled course"],
    ["Subject", spec.subject],
    ["Catalog description", spec.catalogDescription],
    ["Course rationale", spec.rationale],
    ["Learner profile", spec.learnerProfile],
    ["Prior knowledge", spec.priorKnowledge],
    ["Schedule", spec.weeks > 0 && spec.minutesPerSession > 0],
  ] as Array<[string, unknown]>;
  const readyCount = required.filter(([, value]) => Boolean(value)).length;

  return (
    <>
      <SectionHeader
        eyebrow="Course foundation"
        title="Brief"
        description="Define the learners, constraints, and authority that every later research and design decision must respect."
        action={
          <button
            className="button primary"
            onClick={approveBrief}
            disabled={readyCount < required.length || spec.reviewState === "approved"}
          >
            <Check size={16} /> {spec.reviewState === "approved" ? "Brief approved" : "Approve brief"}
          </button>
        }
      />
      <div className="content-grid brief-grid">
        <div className="stack">
          <section className="panel form-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Identity</p><h2>Course context</h2></div>
              <StatusPill tone={spec.reviewState === "approved" ? "good" : "warn"}>
                {spec.reviewState === "approved" ? "Approved" : "Draft"}
              </StatusPill>
            </div>
            <div className="form-grid two">
              <label className="field wide">
                <span>Course title <em>Required</em></span>
                <input value={spec.title} onChange={(e) => updateSpec({ title: e.target.value })} />
              </label>
              <label className="field wide">
                <span>Subject and scope <em>Required</em></span>
                <input
                  value={spec.subject}
                  placeholder="e.g. Urban ecology"
                  onChange={(e) => updateSpec({ subject: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Academic level</span>
                <select value={spec.academicLevel} onChange={(e) => updateSpec({ academicLevel: e.target.value })}>
                  <option>Certificate</option>
                  <option>Lower undergraduate</option>
                  <option>Upper undergraduate</option>
                  <option>Graduate</option>
                </select>
              </label>
              <label className="field">
                <span>Course role</span>
                <select value={spec.courseRole} onChange={(e) => updateSpec({ courseRole: e.target.value })}>
                  <option>General education</option>
                  <option>Elective</option>
                  <option>Major requirement</option>
                  <option>Prerequisite</option>
                  <option>Capstone</option>
                  <option>Professional development</option>
                </select>
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="panel-heading"><div><p className="eyebrow">Learner-facing foundation</p><h2>Purpose and policy</h2></div></div>
            <div className="form-grid">
              <label className="field">
                <span>Catalog description <em>Required</em></span>
                <textarea
                  rows={3}
                  value={spec.catalogDescription ?? ""}
                  placeholder="A concise, student-facing description of the course scope and capabilities."
                  onChange={(e) => updateSpec({ catalogDescription: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Course rationale <em>Required</em></span>
                <textarea
                  rows={3}
                  value={spec.rationale ?? ""}
                  placeholder="Why this course is needed and how its design serves the stated learners."
                  onChange={(e) => updateSpec({ rationale: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Entry diagnostic and support plan</span>
                <textarea
                  rows={3}
                  value={spec.diagnosticPlan ?? ""}
                  placeholder="What will reveal entry needs, and how will support change in response?"
                  onChange={(e) => updateSpec({ diagnosticPlan: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Accessibility statement</span>
                <textarea
                  rows={3}
                  value={spec.accessibilityStatement ?? ""}
                  placeholder="State equivalent access pathways and the applicable institutional process."
                  onChange={(e) => updateSpec({ accessibilityStatement: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Academic integrity and tool use</span>
                <textarea
                  rows={3}
                  value={spec.academicIntegrityPolicy ?? ""}
                  placeholder="Clarify source attribution, originality, assistance disclosure, and prohibited substitution."
                  onChange={(e) => updateSpec({ academicIntegrityPolicy: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Communication and feedback expectations</span>
                <textarea
                  rows={3}
                  value={spec.communicationPolicy ?? ""}
                  placeholder="Set response, feedback, revision, and accessible-format expectations."
                  onChange={(e) => updateSpec({ communicationPolicy: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="panel-heading"><div><p className="eyebrow">Learners</p><h2>Entry state</h2></div></div>
            <div className="form-grid">
              <label className="field">
                <span>Learner profile <em>Required</em></span>
                <textarea
                  rows={3}
                  value={spec.learnerProfile}
                  placeholder="Who are the learners, and what meaningful variability should the design anticipate?"
                  onChange={(e) => updateSpec({ learnerProfile: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Prior knowledge <em>Required</em></span>
                <textarea
                  rows={3}
                  value={spec.priorKnowledge}
                  placeholder="What can the course safely assume?"
                  onChange={(e) => updateSpec({ priorKnowledge: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Prerequisites</span>
                <input value={spec.prerequisites} onChange={(e) => updateSpec({ prerequisites: e.target.value })} />
              </label>
            </div>
          </section>

          <section className="panel form-panel">
            <div className="panel-heading"><div><p className="eyebrow">Delivery</p><h2>Time and access</h2></div></div>
            <div className="form-grid four">
              <label className="field">
                <span>Weeks</span>
                <input type="number" min={1} max={52} value={spec.weeks} onChange={(e) => updateSpec({ weeks: Number(e.target.value) })} />
              </label>
              <label className="field">
                <span>Sessions / week</span>
                <input type="number" min={0} max={14} value={spec.sessionsPerWeek} onChange={(e) => updateSpec({ sessionsPerWeek: Number(e.target.value) })} />
              </label>
              <label className="field">
                <span>Minutes / session</span>
                <input type="number" min={15} value={spec.minutesPerSession} onChange={(e) => updateSpec({ minutesPerSession: Number(e.target.value) })} />
              </label>
              <label className="field">
                <span>Independent min / week</span>
                <input type="number" min={0} value={spec.independentMinutesPerWeek} onChange={(e) => updateSpec({ independentMinutesPerWeek: Number(e.target.value) })} />
              </label>
              <label className="field">
                <span>Modality</span>
                <select value={spec.modality} onChange={(e) => updateSpec({ modality: e.target.value })}>
                  <option>In person</option>
                  <option>Online synchronous</option>
                  <option>Online asynchronous</option>
                  <option>Blended</option>
                  <option>Laboratory</option>
                  <option>Studio</option>
                  <option>Field</option>
                </select>
              </label>
              <label className="field">
                <span>Expected enrollment</span>
                <input type="number" min={1} value={spec.enrollment} onChange={(e) => updateSpec({ enrollment: Number(e.target.value) })} />
              </label>
              <label className="field">
                <span>Maximum material cost</span>
                <div className="input-prefix"><span>$</span><input type="number" min={0} value={spec.materialCostMax} onChange={(e) => updateSpec({ materialCostMax: Number(e.target.value) })} /></div>
              </label>
              <label className="field">
                <span>Risk tier</span>
                <select value={spec.riskTier} onChange={(e) => updateSpec({ riskTier: e.target.value as CourseSpec["riskTier"] })}>
                  <option value="general">General</option>
                  <option value="consequential">Consequential</option>
                  <option value="high_stakes">High-stakes</option>
                  <option value="regulated">Regulated</option>
                </select>
              </label>
              <label className="check-field wide">
                <input type="checkbox" checked={spec.openOnly} onChange={(e) => updateSpec({ openOnly: e.target.checked })} />
                <span><strong>Require open materials</strong><small>Unknown licenses remain cite/link only.</small></span>
              </label>
            </div>
          </section>
        </div>

        <aside className="stack sticky-column">
          <section className="panel readiness">
            <p className="eyebrow">Research gate</p>
            <div className="readiness-score"><strong>{readyCount}</strong><span>of {required.length}<br />brief checks</span></div>
            <div className="checklist">
              {required.map(([label, value]) => (
                <div key={label} className={value ? "complete" : ""}>
                  {value ? <CheckCircle2 size={16} /> : <CircleDot size={16} />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel assumptions-panel">
            <div className="panel-heading"><div><p className="eyebrow">Visible defaults</p><h2>Assumptions</h2></div><span className="count-badge">{project.assumptions.length}</span></div>
            {project.assumptions.map((assumption) => (
              <article className="assumption" key={assumption.id}>
                <div className="assumption-meta"><StatusPill tone={assumption.status === "resolved" ? "good" : "warn"}>{assumption.status}</StatusPill><span>{assumption.confidence} confidence</span></div>
                <p>{assumption.statement}</p>
                <small>{assumption.rationale}</small>
              </article>
            ))}
          </section>
          <section className="privacy-note">
            <LockKeyhole size={17} />
            <p><strong>Browser-local by design.</strong> The brief is saved on this device. No Resea account or application server is involved.</p>
          </section>
        </aside>
      </div>
    </>
  );
}

function ResearchView({
  project,
  setProject,
  notify,
}: {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  notify: (message: string) => void;
}) {
  const [selectedQuestion, setSelectedQuestion] = useState(project.researchPlan.questions[0]?.id ?? "");
  const [query, setQuery] = useState(
    project.researchPlan.questions[0]?.queries[0] ?? "",
  );
  const [results, setResults] = useState<Source[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ title: "", url: "", publisher: "", excerpt: "", locator: "" });

  const plan = project.researchPlan;
  const question = plan.questions.find((item) => item.id === selectedQuestion) ?? plan.questions[0];

  const generatePlan = () => {
    if (project.spec.reviewState !== "approved") {
      notify("Approve the course brief before proposing a research plan.");
      return;
    }
    const nextPlan = createResearchPlan(project.spec);
    setProject((current) => ({
      ...current,
      lifecycle: "RESEARCH_PLANNED",
      researchPlan: nextPlan,
      updatedAt: isoNow(),
    }));
    setSelectedQuestion(nextPlan.questions[0]?.id ?? "");
    setQuery(nextPlan.questions[0]?.queries[0] ?? "");
    notify("A bounded research plan was created from the approved brief.");
  };

  const approvePlan = () => {
    setProject((current) => ({
      ...current,
      lifecycle: "RESEARCH_ACTIVE",
      researchPlan: {
        ...current.researchPlan,
        status: "approved",
        questions: current.researchPlan.questions.map((item) => ({ ...item, status: "approved" })),
      },
      updatedAt: isoNow(),
    }));
    notify("Research plan approved. Discovery is now available.");
  };

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const found = await searchOpenAlex(query.trim());
      setResults(found);
      if (!found.length) setSearchError("No scholarly records matched this query.");
    } catch {
      setSearchError("OpenAlex could not be reached. Keep the plan and try again, or add a source manually.");
    } finally {
      setSearching(false);
    }
  };

  const addResult = (source: Source) => {
    setProject((current) => ({
      ...current,
      sources: [
        ...current.sources,
        { ...source, researchQuestionIds: question ? [question.id] : [] },
      ],
      updatedAt: isoNow(),
    }));
    setResults((current) => current.filter((item) => item.id !== source.id));
    notify("Candidate added for full-text and license review.");
  };

  const addManual = (event: FormEvent) => {
    event.preventDefault();
    try {
      const url = safeResearchUrl(manual.url);
      const today = isoNow().slice(0, 10);
      const sourceId = uid("source");
      const nextSource: Source = {
        id: sourceId,
        title: manual.title,
        authors: [],
        publisher: manual.publisher || sourceDomain(url),
        canonicalUrl: url,
        sourceType: "User-provided web source",
        addedAt: isoNow(),
        access: "unknown",
        license: "unknown",
        allowedActions: ["link"],
        volatility: "user_managed",
        lastChecked: today,
        nextCheck: addDays(today, 90),
        reviewState: "needs_review",
        researchQuestionIds: question ? [question.id] : [],
        score: 50,
        rationale: "Added by the instructor; authority, access, scope, and rights require review.",
      };
      setProject((current) => ({
        ...current,
        sources: [...current.sources, nextSource],
        evidence: manual.excerpt.trim()
          ? [
              ...current.evidence,
              {
                id: uid("evidence"),
                sourceId,
                locator: manual.locator || "User-provided locator",
                exactText: manual.excerpt.trim(),
                annotation: "Exact text supplied by the instructor; verify against the source.",
                claimTypes: [],
                qualityFlags: ["user-provided", "verification-required"],
                reviewState: "needs_review",
              },
            ]
          : current.evidence,
        updatedAt: isoNow(),
      }));
      setManual({ title: "", url: "", publisher: "", excerpt: "", locator: "" });
      setShowManual(false);
      notify("Source added with its provenance and review state intact.");
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "The source could not be added.");
    }
  };

  if (!plan.questions.length) {
    return (
      <>
        <SectionHeader
          eyebrow="Evidence before synthesis"
          title="Research"
          description="Create a bounded, reviewable strategy before opening search or drafting course content."
        />
        <EmptyState
          icon={FlaskConical}
          title="No research plan yet"
          body={project.spec.reviewState === "approved"
            ? "Resea will translate the approved course brief into question families, source targets, query proposals, and explicit stopping conditions. It will not invent search results."
            : "Approve the course brief first. Research questions inherit its learners, constraints, risk tier, and instructor-reviewed assumptions."}
          action={<button className="button primary" disabled={project.spec.reviewState !== "approved"} onClick={generatePlan}><Sparkles size={16} /> Propose research plan</button>}
        />
      </>
    );
  }

  return (
    <>
      <SectionHeader
        eyebrow="Evidence before synthesis"
        title="Research"
        description="Review the questions, search scholarly metadata, and add exact source material without losing provenance."
        action={
          plan.status === "approved" ? (
            <StatusPill tone="good"><Check size={14} /> Plan approved</StatusPill>
          ) : (
            <button className="button primary" onClick={approvePlan}><Check size={16} /> Approve plan</button>
          )
        }
      />
      <div className="research-workbench">
        <section className="research-questions" aria-label="Research questions">
          <div className="pane-title"><span>Research questions</span><span className="count-badge">{plan.questions.length}</span></div>
          {plan.questions.map((item) => (
            <button
              key={item.id}
              className={`question-card ${item.id === question?.id ? "active" : ""}`}
              onClick={() => {
                setSelectedQuestion(item.id);
                setQuery(item.queries[0]);
              }}
            >
              <span className="question-family">{item.family}</span>
              <strong>{item.question}</strong>
              <span className="question-footer"><StatusPill tone={item.status === "sufficient" ? "good" : "neutral"}>{item.status}</StatusPill><span>{item.priority}</span></span>
            </button>
          ))}
          <div className="research-budget">
            <span>Research budget</span>
            <strong>{project.sources.length} / {plan.maxSources} sources</strong>
            <div className="progress-track"><span style={{ width: `${Math.min(100, (project.sources.length / plan.maxSources) * 100)}%` }} /></div>
          </div>
        </section>

        <section className="discovery-pane">
          <div className="pane-title"><span>Discovery</span><StatusPill tone="blue">OpenAlex</StatusPill></div>
          {question ? (
            <div className="question-focus">
              <p className="eyebrow">{question.family}</p>
              <h2>{question.question}</h2>
              <p>{question.rationale}</p>
            </div>
          ) : null}
          <div className="search-box">
            <Search size={18} aria-hidden />
            <input aria-label="Scholarly search query" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runSearch()} />
            <button className="button primary small" disabled={searching || plan.status !== "approved"} onClick={runSearch}>
              {searching ? <Loader2 className="spin" size={15} /> : <Search size={15} />} Search
            </button>
          </div>
          {plan.status !== "approved" ? <div className="inline-notice"><LockKeyhole size={16} /><span>Approve the plan before executing external search.</span></div> : null}
          {searchError ? <div className="inline-notice danger"><AlertTriangle size={16} /><span>{searchError}</span></div> : null}
          <div className="source-results">
            {results.map((source) => (
              <article className="source-result" key={source.id}>
                <div className="source-result-top">
                  <StatusPill>{source.sourceType.replaceAll("-", " ")}</StatusPill>
                  <span className="source-score">{source.score} <small>triage signal</small></span>
                </div>
                <h3>{source.title}</h3>
                <p>{source.authors.slice(0, 3).join(", ")}{source.authors.length > 3 ? " et al." : ""}</p>
                <div className="source-meta"><span>{source.publisher}</span><span>{source.publishedAt?.slice(0, 4) ?? "No date"}</span><span>{source.access.replace("_", " ")}</span></div>
                <div className="source-actions">
                  <a href={source.canonicalUrl} target="_blank" rel="noreferrer">Inspect source <ExternalLink size={13} /></a>
                  <button className="button secondary small" onClick={() => addResult(source)}><Plus size={14} /> Add candidate</button>
                </div>
              </article>
            ))}
            {!results.length && !searching ? (
              <div className="mini-empty">
                <Database size={20} />
                <p>Search results will appear here with a transparent triage signal—not a credibility verdict.</p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="research-context">
          <div className="pane-title"><span>Source set</span><span className="count-badge">{project.sources.length}</span></div>
          <div className="source-stack">
            {project.sources.slice(0, 6).map((source) => (
              <article className="mini-source" key={source.id}>
                <div><StatusPill tone={source.reviewState === "approved" ? "good" : "warn"}>{source.reviewState.replace("_", " ")}</StatusPill><span>{source.score}</span></div>
                <strong>{source.title}</strong>
                <small>{sourceDomain(source.canonicalUrl)} · {source.licenseLabel ?? source.license}</small>
              </article>
            ))}
          </div>
          <button className="button secondary full" onClick={() => setShowManual((value) => !value)}><Plus size={15} /> Add source or excerpt</button>
          {showManual ? (
            <form className="manual-source" onSubmit={addManual}>
              <label className="field"><span>Source title</span><input required value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} /></label>
              <label className="field"><span>HTTPS URL</span><input required type="url" value={manual.url} onChange={(e) => setManual({ ...manual, url: e.target.value })} /></label>
              <label className="field"><span>Publisher</span><input value={manual.publisher} onChange={(e) => setManual({ ...manual, publisher: e.target.value })} /></label>
              <label className="field"><span>Exact excerpt <small>optional</small></span><textarea rows={4} value={manual.excerpt} onChange={(e) => setManual({ ...manual, excerpt: e.target.value })} /></label>
              <label className="field"><span>Locator</span><input placeholder="Page, heading, paragraph, timestamp…" value={manual.locator} onChange={(e) => setManual({ ...manual, locator: e.target.value })} /></label>
              <button className="button primary full" type="submit">Add with provenance</button>
            </form>
          ) : null}
          <div className="inline-notice subtle"><CloudOff size={16} /><span>If CORS blocks a page, paste an exact excerpt or use the optional extension package in this repository.</span></div>
        </aside>
      </div>
    </>
  );
}

function EvidenceView({
  project,
  setProject,
  focusObjectId,
}: {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  focusObjectId?: string;
}) {
  const focusedClaimId =
    project.claims.find((item) => item.id === focusObjectId)?.id ??
    project.claims.find((item) =>
      item.supportingEvidenceIds.some((evidenceId) =>
        project.evidence.some(
          (evidence) =>
            evidence.id === evidenceId && evidence.sourceId === focusObjectId,
        ),
      ),
  )?.id;
  const [selectedClaim, setSelectedClaim] = useState(focusedClaimId ?? project.claims[0]?.id ?? "");
  const claim = project.claims.find((item) => item.id === selectedClaim) ?? project.claims[0];
  const evidence = claim
    ? project.evidence.filter((item) => claim.supportingEvidenceIds.includes(item.id))
    : [];
  const approveSource = (id: string) =>
    setProject((current) => ({
      ...current,
      sources: current.sources.map((source) =>
        source.id === id ? { ...source, reviewState: "approved" } : source,
      ),
      updatedAt: isoNow(),
    }));

  return (
    <>
      <SectionHeader
        eyebrow="The evidence desk"
        title="Evidence"
        description="Inspect the exact excerpts, locators, source conditions, and downstream claims that make a course defensible."
      />
      <div className="evidence-layout">
        <section className="panel source-library">
          <div className="panel-heading"><div><p className="eyebrow">Source library</p><h2>{project.sources.length} sources</h2></div><button className="icon-button" aria-label="Filter sources"><Search size={16} /></button></div>
          <div className="source-table" role="table" aria-label="Project source library">
            <div className="source-row header" role="row"><span>Source</span><span>Type</span><span>Access</span><span>Review</span></div>
            {project.sources.map((source) => (
              <div className="source-row" role="row" key={source.id}>
                <span><strong>{source.title}</strong><small>{source.publisher} · {source.publishedAt?.slice(0, 4) ?? "No date"}</small></span>
                <span>{source.sourceType}</span>
                <span><StatusPill tone={source.access === "open_access" ? "good" : "neutral"}>{source.access.replace("_", " ")}</StatusPill><small>{source.licenseLabel ?? source.license}</small></span>
                <span>
                  {source.reviewState === "approved" ? <StatusPill tone="good">approved</StatusPill> : <button className="text-button" onClick={() => approveSource(source.id)}>Approve</button>}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="evidence-detail-grid">
          <section className="panel claim-list">
            <div className="panel-heading"><div><p className="eyebrow">Claims</p><h2>Qualified propositions</h2></div><span className="count-badge">{project.claims.length}</span></div>
            {project.claims.length ? project.claims.map((item) => (
              <button key={item.id} className={`claim-card ${claim?.id === item.id ? "active" : ""}`} onClick={() => setSelectedClaim(item.id)}>
                <div><StatusPill>{item.type}</StatusPill><StatusPill tone={item.reviewState === "approved" ? "good" : "warn"}>{item.reviewState.replace("_", " ")}</StatusPill></div>
                <strong>{item.text}</strong>
                <span><Link2 size={13} /> {item.supportingEvidenceIds.length} supporting evidence unit{item.supportingEvidenceIds.length === 1 ? "" : "s"}</span>
              </button>
            )) : <EmptyState icon={Link2} title="No claims yet" body="Claims are only useful after an exact evidence excerpt and locator exist." />}
          </section>

          <section className="panel evidence-inspector">
            <div className="panel-heading"><div><p className="eyebrow">Citation inspector</p><h2>Exact support</h2></div></div>
            {claim ? (
              <>
                <div className="claim-summary"><span>Claim</span><p>{claim.text}</p></div>
                {evidence.map((item) => {
                  const source = project.sources.find((entry) => entry.id === item.sourceId);
                  return (
                    <article className="evidence-quote" key={item.id}>
                      <div className="evidence-source">
                        <div><strong>{source?.title ?? "Missing source"}</strong><span>{item.locator}</span></div>
                        {source ? <a href={source.canonicalUrl} target="_blank" rel="noreferrer" aria-label={`Open ${source.title}`}><ExternalLink size={15} /></a> : null}
                      </div>
                      <blockquote>{item.exactText}</blockquote>
                      <p>{item.annotation}</p>
                      <div className="evidence-footer"><StatusPill tone={item.reviewState === "approved" ? "good" : "warn"}>{item.reviewState.replace("_", " ")}</StatusPill><span>Retrieved {formatDate(source?.lastChecked)}</span></div>
                    </article>
                  );
                })}
                {!evidence.length ? <div className="inline-notice danger"><AlertTriangle size={16} /><span>This claim has no resolvable evidence.</span></div> : null}
              </>
            ) : <EmptyState icon={BookOpen} title="Select a claim" body="Choose a claim to inspect its exact source support." />}
          </section>
        </div>
      </div>
    </>
  );
}

function MapView({ project }: { project: ProjectState }) {
  const metrics = alignmentMetrics(project);
  return (
    <>
      <SectionHeader
        eyebrow="Prerequisites and alignment"
        title="Curriculum map"
        description="Move from evidence to an explicit sequence of concepts, outcomes, practice, and assessment."
        action={<StatusPill tone="blue"><GitBranch size={14} /> Accessible outline</StatusPill>}
      />
      <div className="map-metrics">
        <section className="metric-card"><span>Assessment coverage</span><strong>{metrics.assessmentCoverage}%</strong><small>Target 100%</small></section>
        <section className="metric-card"><span>Practice coverage</span><strong>{metrics.practiceCoverage}%</strong><small>Target 100%</small></section>
        <section className="metric-card"><span>Orphan assessments</span><strong>{metrics.orphanAssessments}</strong><small>Target 0</small></section>
      </div>
      <div className="content-grid map-grid">
        <section className="panel concept-outline">
          <div className="panel-heading"><div><p className="eyebrow">Keyboard-accessible graph alternative</p><h2>Concept sequence</h2></div><span className="count-badge">{project.concepts.length}</span></div>
          {project.concepts.length ? project.concepts.map((concept, index) => (
            <article className="concept-node" key={concept.id}>
              <div className="concept-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="concept-content">
                <div><strong>{concept.label}</strong><StatusPill tone={concept.role === "core" ? "blue" : "neutral"}>{concept.role}</StatusPill></div>
                <p>{concept.definition}</p>
                <small>
                  {concept.prerequisiteIds.length
                    ? `Requires ${concept.prerequisiteIds.map((id) => project.concepts.find((item) => item.id === id)?.label).filter(Boolean).join(", ")}`
                    : "No prerequisite in this course"}
                </small>
              </div>
              {index < project.concepts.length - 1 ? <span className="concept-line" /> : null}
            </article>
          )) : <EmptyState icon={Network} title="No concept map yet" body="Approve evidence-backed claims before defining domain concepts." />}
        </section>
        <section className="panel alignment-panel">
          <div className="panel-heading"><div><p className="eyebrow">Backward design</p><h2>Outcome alignment</h2></div></div>
          {project.outcomes.map((outcome) => {
            const activities = project.modules.flatMap((module) => module.activities).filter((item) => item.outcomeIds.includes(outcome.id));
            const assessments = project.modules.flatMap((module) => module.assessments).filter((item) => item.outcomeIds.includes(outcome.id));
            return (
              <article className="alignment-row" key={outcome.id}>
                <div className="outcome-code">{outcome.code}</div>
                <div className="outcome-body">
                  <h3>{outcome.action} {outcome.object}</h3>
                  <p>{outcome.conditions}. <strong>Criteria:</strong> {outcome.criteria}.</p>
                  <div className="alignment-links">
                    <span><BookOpen size={14} /> {outcome.conceptIds.length} concepts</span>
                    <span className={activities.length ? "mapped" : "gap"}><GraduationCap size={14} /> {activities.length} practice</span>
                    <span className={assessments.length ? "mapped" : "gap"}><ClipboardCheck size={14} /> {assessments.length} assessment</span>
                  </div>
                </div>
              </article>
            );
          })}
          {!project.outcomes.length ? <EmptyState icon={GraduationCap} title="No outcomes yet" body="Outcomes should be proposed from the approved concept graph, not generated as a generic list." /> : null}
        </section>
      </div>
    </>
  );
}

function BuildView({
  project,
  setProject,
  notify,
  focusObjectId,
}: {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  notify: (message: string) => void;
  focusObjectId?: string;
}) {
  const [selectedModule, setSelectedModule] = useState(
    project.modules.some((module) => module.id === focusObjectId)
      ? focusObjectId ?? ""
      : project.modules[0]?.id ?? "",
  );
  const [editor, setEditor] = useState<"activity" | "assessment" | null>(null);
  const [activityDraft, setActivityDraft] = useState({
    title: "",
    type: "Guided practice",
    instructions: "",
    outcomeId: "",
    estimatedMinutes: 30,
    feedback: "Instructor feedback",
    accessibilityAlternative: "",
    preparation: "",
    successIndicators: "",
  });
  const [assessmentDraft, setAssessmentDraft] = useState({
    title: "",
    type: "Performance task",
    stakes: "formative" as Assessment["stakes"],
    purpose: "",
    task: "",
    outcomeId: "",
    expectedEvidence: "",
    estimatedMinutes: 45,
    gradingMinutesPerStudent: 8,
    rubricCriteria: "",
    feedbackStrategy: "",
    collaborationPolicy: "",
    sourcePolicy: "",
    toolPolicy: "Course tools are optional unless the instructor specifies otherwise.",
    integrityNotes: "",
    alignmentRationale: "",
    evaluatorGuidance: "",
    accessibilityAlternative: "",
  });
  const selectedModuleObject =
    project.modules.find((item) => item.id === selectedModule) ??
    project.modules[0];
  const availableOutcomes = project.outcomes.filter((outcome) =>
    selectedModuleObject?.outcomeIds.includes(outcome.id),
  );

  const openEditor = (kind: "activity" | "assessment") => {
    const outcomeId = availableOutcomes[0]?.id ?? "";
    if (kind === "activity") {
      setActivityDraft((current) => ({ ...current, outcomeId }));
    } else {
      setAssessmentDraft((current) => ({ ...current, outcomeId }));
    }
    setEditor(kind);
  };

  const addActivity = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedModuleObject || !activityDraft.outcomeId) return;
    if (
      !activityDraft.title.trim() ||
      !activityDraft.type.trim() ||
      !activityDraft.instructions.trim() ||
      !activityDraft.feedback.trim()
    ) {
      notify("Complete the activity title, type, instructions, and feedback method.");
      return;
    }
    const activity: Activity = {
      id: uid("activity"),
      title: activityDraft.title.trim(),
      type: activityDraft.type.trim(),
      instructions: activityDraft.instructions.trim(),
      outcomeIds: [activityDraft.outcomeId],
      estimatedMinutes: activityDraft.estimatedMinutes,
      feedback: activityDraft.feedback.trim(),
      accessibilityAlternatives: activityDraft.accessibilityAlternative.trim()
        ? [activityDraft.accessibilityAlternative.trim()]
        : [],
      preparation: activityDraft.preparation.trim() || undefined,
      successIndicators: activityDraft.successIndicators
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    setProject((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === selectedModuleObject.id
          ? {
              ...module,
              activities: [...module.activities, activity],
              estimatedStudentMinutes:
                module.estimatedStudentMinutes + activity.estimatedMinutes,
              reviewState: "needs_review",
            }
          : module,
      ),
      outcomes: current.outcomes.map((outcome) =>
        outcome.id === activityDraft.outcomeId
          ? {
              ...outcome,
              activityIds: [...new Set([...outcome.activityIds, activity.id])],
              reviewState: "needs_review",
            }
          : outcome,
      ),
      updatedAt: isoNow(),
      events: [
        ...current.events,
        {
          id: uid("event"),
          at: isoNow(),
          action: "Activity added",
          detail: `Added ${activity.title} to ${selectedModuleObject.title}; mapped outcome requires review.`,
        },
      ],
    }));
    setActivityDraft({
      title: "",
      type: "Guided practice",
      instructions: "",
      outcomeId: availableOutcomes[0]?.id ?? "",
      estimatedMinutes: 30,
      feedback: "Instructor feedback",
      accessibilityAlternative: "",
      preparation: "",
      successIndicators: "",
    });
    setEditor(null);
    notify("Activity added; workload and outcome alignment were updated for review.");
  };

  const addAssessment = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedModuleObject || !assessmentDraft.outcomeId) return;
    if (
      !assessmentDraft.title.trim() ||
      !assessmentDraft.type.trim() ||
      !assessmentDraft.purpose.trim() ||
      !assessmentDraft.task.trim() ||
      !assessmentDraft.expectedEvidence.trim() ||
      !assessmentDraft.alignmentRationale.trim() ||
      !assessmentDraft.rubricCriteria.split(",").some((criterion) => criterion.trim())
    ) {
      notify("Complete the assessment purpose, task, expected evidence, alignment rationale, and rubric.");
      return;
    }
    const assessment: Assessment = {
      id: uid("assessment"),
      title: assessmentDraft.title.trim(),
      type: assessmentDraft.type.trim(),
      stakes: assessmentDraft.stakes,
      purpose: assessmentDraft.purpose.trim(),
      task: assessmentDraft.task.trim(),
      outcomeIds: [assessmentDraft.outcomeId],
      expectedEvidence: assessmentDraft.expectedEvidence
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      estimatedMinutes: assessmentDraft.estimatedMinutes,
      gradingMinutesPerStudent: assessmentDraft.gradingMinutesPerStudent,
      rubricCriteria: assessmentDraft.rubricCriteria
        .split(",")
        .map((criterion) => criterion.trim())
        .filter(Boolean),
      feedbackStrategy: assessmentDraft.feedbackStrategy.trim(),
      collaborationPolicy: assessmentDraft.collaborationPolicy.trim(),
      sourcePolicy: assessmentDraft.sourcePolicy.trim(),
      toolPolicy: assessmentDraft.toolPolicy.trim(),
      integrityNotes: assessmentDraft.integrityNotes.trim(),
      alignmentRationale: assessmentDraft.alignmentRationale.trim(),
      evaluatorGuidance: assessmentDraft.evaluatorGuidance.trim(),
      accessibilityAlternatives: assessmentDraft.accessibilityAlternative.trim()
        ? [assessmentDraft.accessibilityAlternative.trim()]
        : [],
    };
    setProject((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === selectedModuleObject.id
          ? {
              ...module,
              assessments: [...module.assessments, assessment],
              estimatedStudentMinutes:
                module.estimatedStudentMinutes + assessment.estimatedMinutes,
              reviewState: "needs_review",
            }
          : module,
      ),
      outcomes: current.outcomes.map((outcome) =>
        outcome.id === assessmentDraft.outcomeId
          ? {
              ...outcome,
              assessmentIds: [
                ...new Set([...outcome.assessmentIds, assessment.id]),
              ],
              reviewState: "needs_review",
            }
          : outcome,
      ),
      updatedAt: isoNow(),
      events: [
        ...current.events,
        {
          id: uid("event"),
          at: isoNow(),
          action: "Assessment added",
          detail: `Added ${assessment.title} to ${selectedModuleObject.title}; mapped outcome requires review.`,
        },
      ],
    }));
    setAssessmentDraft({
      title: "",
      type: "Performance task",
      stakes: "formative",
      purpose: "",
      task: "",
      outcomeId: availableOutcomes[0]?.id ?? "",
      expectedEvidence: "",
      estimatedMinutes: 45,
      gradingMinutesPerStudent: 8,
      rubricCriteria: "",
      feedbackStrategy: "",
      collaborationPolicy: "",
      sourcePolicy: "",
      toolPolicy: "Course tools are optional unless the instructor specifies otherwise.",
      integrityNotes: "",
      alignmentRationale: "",
      evaluatorGuidance: "",
      accessibilityAlternative: "",
    });
    setEditor(null);
    notify("Assessment added; workload, grading load, and alignment were updated for review.");
  };

  return (
    <>
      <SectionHeader
        eyebrow="Canonical course objects"
        title="Build"
        description="Develop one module at a time. Approved modules remain stable when another module changes."
      />
      <div className="builder-layout">
        <aside className="module-tree panel">
          <div className="pane-title"><span>Course structure</span><span className="count-badge">{project.modules.length}</span></div>
          <div className="tree-root"><BookOpen size={16} /><strong>{project.spec.title}</strong></div>
          {project.modules.map((item) => (
            <button key={item.id} className={`tree-item ${selectedModuleObject?.id === item.id ? "active" : ""}`} onClick={() => { setSelectedModule(item.id); setEditor(null); }}>
              <span>{String(item.order).padStart(2, "0")}</span>
              <div><strong>{item.title}</strong><small>{item.estimatedStudentMinutes} min · {item.reviewState.replace("_", " ")}</small></div>
            </button>
          ))}
        </aside>
        <section className="module-editor">
          {selectedModuleObject ? (
            <>
              <div className="module-titlebar">
                <div><p className="eyebrow">Module {selectedModuleObject.order}</p><h2>{selectedModuleObject.title}</h2><p>{selectedModuleObject.summary}</p></div>
                <StatusPill tone={selectedModuleObject.reviewState === "approved" ? "good" : "warn"}>{selectedModuleObject.reviewState.replace("_", " ")}</StatusPill>
              </div>
              <div className="module-stats">
                <span><GraduationCap size={16} /><strong>{selectedModuleObject.outcomeIds.length}</strong> outcomes</span>
                <span><BookOpen size={16} /><strong>{selectedModuleObject.sourceIds.length}</strong> sources</span>
                <span><History size={16} /><strong>{selectedModuleObject.estimatedStudentMinutes}</strong> min workload</span>
              </div>
              {editor === "activity" ? (
                <form className="object-editor" onSubmit={addActivity}>
                  <div className="object-editor-heading"><div><p className="eyebrow">New canonical object</p><h3>Add activity</h3></div><button type="button" className="icon-button" aria-label="Close activity editor" onClick={() => setEditor(null)}><X size={16} /></button></div>
                  <div className="form-grid two">
                    <label className="field"><span>Title</span><input required value={activityDraft.title} onChange={(e) => setActivityDraft({ ...activityDraft, title: e.target.value })} /></label>
                    <label className="field"><span>Activity type</span><input required value={activityDraft.type} onChange={(e) => setActivityDraft({ ...activityDraft, type: e.target.value })} /></label>
                    <label className="field wide"><span>Instructions</span><textarea required rows={3} value={activityDraft.instructions} onChange={(e) => setActivityDraft({ ...activityDraft, instructions: e.target.value })} /></label>
                    <label className="field"><span>Preparation</span><textarea rows={2} value={activityDraft.preparation} onChange={(e) => setActivityDraft({ ...activityDraft, preparation: e.target.value })} /></label>
                    <label className="field"><span>Success indicators <small>one per line</small></span><textarea rows={2} value={activityDraft.successIndicators} onChange={(e) => setActivityDraft({ ...activityDraft, successIndicators: e.target.value })} /></label>
                    <label className="field"><span>Mapped outcome</span><select required value={activityDraft.outcomeId} onChange={(e) => setActivityDraft({ ...activityDraft, outcomeId: e.target.value })}><option value="">Select an outcome</option>{availableOutcomes.map((outcome) => <option key={outcome.id} value={outcome.id}>{outcome.code}: {outcome.action} {outcome.object}</option>)}</select></label>
                    <label className="field"><span>Student minutes</span><input required min={1} type="number" value={activityDraft.estimatedMinutes} onChange={(e) => setActivityDraft({ ...activityDraft, estimatedMinutes: Number(e.target.value) })} /></label>
                    <label className="field"><span>Feedback method</span><input required value={activityDraft.feedback} onChange={(e) => setActivityDraft({ ...activityDraft, feedback: e.target.value })} /></label>
                    <label className="field"><span>Accessibility alternative</span><input value={activityDraft.accessibilityAlternative} onChange={(e) => setActivityDraft({ ...activityDraft, accessibilityAlternative: e.target.value })} placeholder="Equivalent text, audio, or low-bandwidth path" /></label>
                  </div>
                  {!availableOutcomes.length ? <div className="inline-notice danger"><AlertTriangle size={16} /><span>This module needs an approved outcome before adding practice.</span></div> : null}
                  <div className="object-editor-actions"><button type="button" className="button secondary" onClick={() => setEditor(null)}>Cancel</button><button className="button primary" disabled={!availableOutcomes.length}><Plus size={15} /> Add activity</button></div>
                </form>
              ) : null}
              {editor === "assessment" ? (
                <form className="object-editor" onSubmit={addAssessment}>
                  <div className="object-editor-heading"><div><p className="eyebrow">New canonical object</p><h3>Add assessment</h3></div><button type="button" className="icon-button" aria-label="Close assessment editor" onClick={() => setEditor(null)}><X size={16} /></button></div>
                  <div className="form-grid two">
                    <label className="field"><span>Title</span><input required value={assessmentDraft.title} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, title: e.target.value })} /></label>
                    <label className="field"><span>Assessment type</span><input required value={assessmentDraft.type} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, type: e.target.value })} /></label>
                    <label className="field"><span>Stakes</span><select value={assessmentDraft.stakes} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, stakes: e.target.value as Assessment["stakes"] })}><option value="diagnostic">Diagnostic</option><option value="formative">Formative</option><option value="summative">Summative</option></select></label>
                    <label className="field"><span>Mapped outcome</span><select required value={assessmentDraft.outcomeId} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, outcomeId: e.target.value })}><option value="">Select an outcome</option>{availableOutcomes.map((outcome) => <option key={outcome.id} value={outcome.id}>{outcome.code}: {outcome.action} {outcome.object}</option>)}</select></label>
                    <label className="field wide"><span>Purpose <em>Required</em></span><textarea required rows={2} value={assessmentDraft.purpose} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, purpose: e.target.value })} placeholder="What evidence of learning should this assessment establish?" /></label>
                    <label className="field wide"><span>Student task</span><textarea required rows={3} value={assessmentDraft.task} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, task: e.target.value })} /></label>
                    <label className="field wide"><span>Expected evidence <small>one item per line</small></span><textarea required rows={3} value={assessmentDraft.expectedEvidence} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, expectedEvidence: e.target.value })} /></label>
                    <label className="field wide"><span>Why this measures the outcome</span><textarea required rows={2} value={assessmentDraft.alignmentRationale} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, alignmentRationale: e.target.value })} /></label>
                    <label className="field"><span>Student minutes</span><input required min={1} type="number" value={assessmentDraft.estimatedMinutes} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, estimatedMinutes: Number(e.target.value) })} /></label>
                    <label className="field"><span>Grading minutes / student</span><input required min={0} type="number" value={assessmentDraft.gradingMinutesPerStudent} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, gradingMinutesPerStudent: Number(e.target.value) })} /></label>
                    <label className="field wide"><span>Rubric criteria</span><input required value={assessmentDraft.rubricCriteria} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, rubricCriteria: e.target.value })} placeholder="Accuracy, evidence use, interpretation" /></label>
                    <label className="field"><span>Feedback strategy</span><textarea rows={2} value={assessmentDraft.feedbackStrategy} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, feedbackStrategy: e.target.value })} /></label>
                    <label className="field"><span>Collaboration policy</span><textarea rows={2} value={assessmentDraft.collaborationPolicy} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, collaborationPolicy: e.target.value })} /></label>
                    <label className="field"><span>Source and originality policy</span><textarea rows={2} value={assessmentDraft.sourcePolicy} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, sourcePolicy: e.target.value })} /></label>
                    <label className="field"><span>Tool policy</span><textarea rows={2} value={assessmentDraft.toolPolicy} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, toolPolicy: e.target.value })} /></label>
                    <label className="field"><span>Integrity and security notes</span><textarea rows={2} value={assessmentDraft.integrityNotes} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, integrityNotes: e.target.value })} /></label>
                    <label className="field"><span>Evaluator guidance</span><textarea rows={2} value={assessmentDraft.evaluatorGuidance} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, evaluatorGuidance: e.target.value })} /></label>
                    <label className="field"><span>Accessibility alternative</span><textarea rows={2} value={assessmentDraft.accessibilityAlternative} onChange={(e) => setAssessmentDraft({ ...assessmentDraft, accessibilityAlternative: e.target.value })} /></label>
                  </div>
                  {!availableOutcomes.length ? <div className="inline-notice danger"><AlertTriangle size={16} /><span>This module needs an approved outcome before adding an assessment.</span></div> : null}
                  <div className="object-editor-actions"><button type="button" className="button secondary" onClick={() => setEditor(null)}>Cancel</button><button className="button primary" disabled={!availableOutcomes.length}><Plus size={15} /> Add assessment</button></div>
                </form>
              ) : null}
              <section className="object-section">
                <div className="object-heading"><div><p className="eyebrow">Practice</p><h3>Activities and feedback</h3></div><button className="button ghost small" onClick={() => openEditor("activity")}><Plus size={14} /> Add activity</button></div>
                {selectedModuleObject.activities.length ? selectedModuleObject.activities.map((activity) => (
                  <article className="object-card" key={activity.id}>
                    <div className="object-icon"><GraduationCap size={17} /></div>
                    <div className="object-main">
                      <div><h4>{activity.title}</h4><StatusPill>{activity.type}</StatusPill></div>
                      <p>{activity.instructions}</p>
                      <div className="object-meta"><span>{activity.estimatedMinutes} min</span><span>{activity.feedback}</span><span>{activity.accessibilityAlternatives.length} access paths</span></div>
                    </div>
                  </article>
                )) : <EmptyState icon={GraduationCap} title="Practice gap" body="This module maps outcomes but does not yet give learners a feedback-bearing opportunity to practice." />}
              </section>
              <section className="object-section">
                <div className="object-heading"><div><p className="eyebrow">Evidence of learning</p><h3>Assessments and rubrics</h3></div><button className="button ghost small" onClick={() => openEditor("assessment")}><Plus size={14} /> Add assessment</button></div>
                {selectedModuleObject.assessments.length ? selectedModuleObject.assessments.map((assessment) => (
                  <article className="object-card assessment" key={assessment.id}>
                    <div className="object-icon"><ClipboardCheck size={17} /></div>
                    <div className="object-main">
                      <div><h4>{assessment.title}</h4><StatusPill tone={assessment.stakes === "summative" ? "blue" : "neutral"}>{assessment.stakes}</StatusPill></div>
                      <p>{assessment.task}</p>
                      <div className="rubric-list">{assessment.rubricCriteria.map((criterion) => <span key={criterion}>{criterion}</span>)}</div>
                      <div className="object-meta"><span>{assessment.estimatedMinutes} student min</span><span>{assessment.gradingMinutesPerStudent * project.spec.enrollment} total grading min</span></div>
                    </div>
                  </article>
                )) : <div className="mini-empty"><ClipboardCheck size={20} /><p>No assessment in this module. That is acceptable when the outcome is measured later.</p></div>}
              </section>
            </>
          ) : <EmptyState icon={LayoutList} title="No modules yet" body="Modules are built only after outcomes and assessment strategy are approved." />}
        </section>
      </div>
    </>
  );
}

function AuditView({
  project,
  onNavigate,
}: {
  project: ProjectState;
  onNavigate: (view: ViewId, focusObjectId?: string) => void;
}) {
  const findings = runAudit(project);
  const summary = auditSummary(findings);
  const metrics = alignmentMetrics(project);
  const [filter, setFilter] = useState<"all" | AuditFinding["severity"]>("all");
  const visible = filter === "all" ? findings : findings.filter((item) => item.severity === filter);
  const findingWorkspace = (category: string): ViewId => {
    if (["Evidence & citations", "Licensing & access"].includes(category)) return "evidence";
    if (category === "Freshness") return "refresh";
    if (["Outcomes", "Concept sequence"].includes(category)) return "map";
    if (category === "Risk & review") return "brief";
    return "build";
  };

  return (
    <>
      <SectionHeader
        eyebrow="Deterministic quality gates"
        title="Audit"
        description="Find missing evidence, broken alignment, prerequisite cycles, workload pressure, access risks, and publication blockers."
        action={<StatusPill tone={summary.canPublish ? "good" : "danger"}>{summary.canPublish ? "No critical blockers" : "Publication blocked"}</StatusPill>}
      />
      <div className="audit-overview">
        <section className="audit-score-card">
          <div className={`audit-ring ${summary.canPublish ? "pass" : "fail"}`}><strong>{summary.canPublish ? "PASS" : summary.critical}</strong><span>{summary.canPublish ? "critical gate" : "critical"}</span></div>
          <div><p className="eyebrow">Publication readiness</p><h2>{summary.canPublish ? "Structurally publishable" : "Resolve blockers first"}</h2><p>Passing deterministic gates does not certify disciplinary correctness. Instructor approval remains required.</p></div>
        </section>
        <section className="panel audit-metrics">
          <ProgressBar value={metrics.assessmentCoverage} label="Outcome → assessment" />
          <ProgressBar value={metrics.practiceCoverage} label="Outcome → practice" />
          <ProgressBar value={Math.round((project.claims.filter((claim) => claim.supportingEvidenceIds.length).length / Math.max(1, project.claims.length)) * 100)} label="Claim → evidence" />
        </section>
      </div>
      <div className="audit-toolbar">
        <div className="severity-tabs" role="tablist" aria-label="Filter audit findings">
          {(["all", "critical", "high", "medium", "advisory"] as const).map((item) => (
            <button role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>
              {item} {item === "all" ? findings.length : findings.filter((finding) => finding.severity === item).length}
            </button>
          ))}
        </div>
        <span className="audit-version">Rule set 1.0.0 · {formatDate(isoNow())}</span>
      </div>
      <div className="finding-list">
        {visible.map((item) => (
          <article className={`finding ${item.severity}`} key={item.id}>
            <div className="finding-severity"><AlertTriangle size={17} /><span>{item.severity}</span></div>
            <div className="finding-body"><div><code>{item.ruleId}</code><span>{item.checkerType.replace("_", " ")}</span></div><h3>{item.title}</h3><p>{item.description}</p><small><strong>Remediation:</strong> {item.remediation}</small></div>
            <button className="button ghost small" onClick={() => onNavigate(findingWorkspace(item.category), item.objectIds[0])}>Open workspace <ArrowRight size={14} /></button>
          </article>
        ))}
        {!visible.length ? <EmptyState icon={CheckCircle2} title="No findings in this category" body="The current canonical objects pass these structural checks." /> : null}
      </div>
    </>
  );
}

function RefreshView({ project, setProject, notify }: { project: ProjectState; setProject: React.Dispatch<React.SetStateAction<ProjectState>>; notify: (message: string) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const due = project.sources.filter((source) => source.nextCheck < today);
  const [checking, setChecking] = useState<string | null>(null);
  const checkSource = async (source: Source) => {
    setChecking(source.id);
    try {
      const response = await fetch(source.canonicalUrl, { method: "HEAD", mode: "cors" });
      const checked = isoNow().slice(0, 10);
      setProject((current) => ({
        ...current,
        sources: current.sources.map((item) =>
          item.id === source.id
            ? { ...item, lastChecked: checked, nextCheck: addDays(checked, item.volatility === "fast" ? 30 : item.volatility === "moderate" ? 90 : item.volatility === "stable" ? 365 : 180) }
            : item,
        ),
        events: [...current.events, { id: uid("event"), at: isoNow(), action: "Freshness check", detail: `${source.title}: HTTP ${response.status}; metadata reviewed.` }],
      }));
      notify("Source metadata checked. No curriculum object was changed.");
    } catch {
      notify("The source requires manual capture or extension permission; prior evidence was preserved.");
    } finally {
      setChecking(null);
    }
  };
  return (
    <>
      <SectionHeader
        eyebrow="Traceable currency"
        title="Refresh"
        description="Check evidence according to explicit intervals, then review impact before changing approved course objects."
        action={<StatusPill tone={due.length ? "warn" : "good"}>{due.length ? `${due.length} due` : "Sources current"}</StatusPill>}
      />
      <div className="freshness-banner">
        <RefreshCw size={22} />
        <div><strong>Freshness is not truth.</strong><p>Resea records when evidence was checked and what changed. A recent retrieval still requires academic judgment.</p></div>
      </div>
      <section className="panel refresh-table">
        <div className="panel-heading"><div><p className="eyebrow">Source review queue</p><h2>{project.sources.length} tracked sources</h2></div></div>
        {project.sources.map((source) => {
          const isDue = source.nextCheck < today;
          return (
            <article className="refresh-row" key={source.id}>
              <div className={`freshness-dot ${isDue ? "due" : "fresh"}`} />
              <div className="refresh-source"><strong>{source.title}</strong><small>{source.volatility.replace("_", " ")} · {sourceDomain(source.canonicalUrl)}</small></div>
              <div><span>Last checked</span><strong>{formatDate(source.lastChecked)}</strong></div>
              <div><span>Next review</span><strong>{formatDate(source.nextCheck)}</strong></div>
              <StatusPill tone={isDue ? "warn" : "good"}>{isDue ? "due" : "fresh"}</StatusPill>
              <button className="button secondary small" disabled={checking === source.id} onClick={() => checkSource(source)}>
                {checking === source.id ? <Loader2 className="spin" size={14} /> : <RefreshCw size={14} />} Check
              </button>
            </article>
          );
        })}
      </section>
      <section className="panel impact-card">
        <div className="panel-heading"><div><p className="eyebrow">Impact policy</p><h2>No silent replacement</h2></div><GitBranch size={20} /></div>
        <p>When source content changes, Resea creates a proposal that traverses evidence → claims → concepts and outcomes → modules and assessments. Published versions remain immutable until an instructor approves a new version.</p>
      </section>
    </>
  );
}

function VersionsView({
  project,
  setProject,
  notify,
  importRef,
  onExport,
}: {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  notify: (message: string) => void;
  importRef: React.RefObject<HTMLInputElement | null>;
  onExport: (format: "markdown" | "json" | "csv" | "bundle") => Promise<void>;
}) {
  const findings = runAudit(project);
  const summary = auditSummary(findings);
  const outputQuality = evaluateOutputQuality(project);
  const publicationEligible = summary.canPublish && outputQuality.blocked === 0;
  const [approver, setApprover] = useState("Local instructor");
  const [notes, setNotes] = useState("Initial evidence-backed course design.");
  const [publishing, setPublishing] = useState(false);
  const publish = async () => {
    setPublishing(true);
    const manifest = {
      projectId: project.id,
      objectIds: [
        project.spec.id,
        ...project.sources.map((item) => item.id),
        ...project.evidence.map((item) => item.id),
        ...project.claims.map((item) => item.id),
        ...project.concepts.map((item) => item.id),
        ...project.outcomes.map((item) => item.id),
        ...project.modules.map((item) => item.id),
      ],
      ruleSetVersion: "1.0.0",
      rendererVersion: OUTPUT_RENDERER_VERSION,
      outputQualityStatus: outputQuality.status,
    };
    const manifestHash = await sha256(JSON.stringify(manifest));
    const versionNumber = project.versions.length + 1;
    setProject((current) => ({
      ...current,
      lifecycle: "PUBLISHED",
      versions: [
        ...current.versions,
        {
          id: uid("version"),
          label: `v1.${versionNumber - 1}`,
          createdAt: isoNow(),
          approvedBy: approver,
          releaseNotes: notes,
          manifestHash,
          findingCount: findings.length,
        },
      ],
      events: [
        ...current.events,
        { id: uid("event"), at: isoNow(), action: "Version published", detail: `${approver} approved v1.${versionNumber - 1}.` },
      ],
    }));
    setPublishing(false);
    notify("Immutable local version published. Back up the project next.");
  };
  return (
    <>
      <SectionHeader
        eyebrow="Immutable review history"
        title="Versions & export"
        description="Inspect learner-release quality, publish reviewed object manifests, and create a complete portable academic package."
      />
      <div className="content-grid versions-grid">
        <div className="stack">
          <section className="panel output-quality-card">
            <div className="panel-heading">
              <div><p className="eyebrow">Quality before format</p><h2>Output readiness</h2></div>
              <StatusPill tone={outputQuality.blocked ? "danger" : outputQuality.review ? "warn" : "good"}>
                {outputQuality.blocked ? "Blocked" : outputQuality.review ? "Instructor review" : "Learner ready"}
              </StatusPill>
            </div>
            <p>The package separates student materials, instructor guidance, assessment briefs, research evidence, schedules, rubrics, freshness, and quality reports. Missing decisions remain explicit completion requirements.</p>
            <div className="output-quality-summary">
              <span className="good"><strong>{outputQuality.passed}</strong> pass</span>
              <span className="warn"><strong>{outputQuality.review}</strong> review</span>
              <span className="danger"><strong>{outputQuality.blocked}</strong> block</span>
            </div>
            <div className="output-checks">
              {outputQuality.checks.map((check) => (
                <div className={check.status} key={check.id}>
                  {check.status === "pass" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <div><strong>{check.label}</strong><span>{check.detail}</span></div>
                </div>
              ))}
            </div>
          </section>
          <section className="panel publish-card">
            <div className="panel-heading"><div><p className="eyebrow">Publication gate</p><h2>Create a local version</h2></div><StatusPill tone={publicationEligible ? "good" : "danger"}>{publicationEligible ? "Eligible" : "Blocked"}</StatusPill></div>
            <p>Publication freezes a manifest of canonical object IDs and an integrity hash. It does not assert accreditation or replace disciplinary review.</p>
            <div className="form-grid two">
              <label className="field"><span>Approving identity</span><input value={approver} onChange={(e) => setApprover(e.target.value)} /></label>
              <label className="field wide"><span>Release notes</span><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
            </div>
            {!summary.canPublish ? <div className="inline-notice danger"><AlertTriangle size={16} /><span>{summary.critical} critical finding{summary.critical === 1 ? "" : "s"} must be resolved. Critical issues cannot be waived.</span></div> : null}
            {summary.canPublish && outputQuality.blocked ? <div className="inline-notice danger"><AlertTriangle size={16} /><span>{outputQuality.blocked} output-readiness blocker{outputQuality.blocked === 1 ? "" : "s"} must be resolved before version publication.</span></div> : null}
            <button className="button primary" onClick={publish} disabled={!publicationEligible || !approver.trim() || publishing}>{publishing ? <Loader2 className="spin" size={16} /> : <LockKeyhole size={16} />} Publish version</button>
          </section>
          <section className="panel version-history">
            <div className="panel-heading"><div><p className="eyebrow">History</p><h2>Published versions</h2></div><span className="count-badge">{project.versions.length}</span></div>
            {project.versions.length ? [...project.versions].reverse().map((version) => (
              <article className="version-row" key={version.id}>
                <div className="version-mark"><Check size={16} /></div>
                <div><strong>{version.label}</strong><span>{formatDate(version.createdAt)} · {version.approvedBy}</span><p>{version.releaseNotes}</p><code>{version.manifestHash.slice(0, 18)}…</code></div>
                <StatusPill tone="good">{version.findingCount} findings recorded</StatusPill>
              </article>
            )) : <EmptyState icon={History} title="No published version" body="Run the full audit and record an approving identity to freeze the first manifest." />}
          </section>
        </div>
        <aside className="stack sticky-column">
          <section className="panel export-card">
            <div className="panel-heading"><div><p className="eyebrow">Portable by default</p><h2>Academic package</h2></div><Download size={18} /></div>
            <button className="export-option" onClick={() => onExport("bundle")}><span className="filetype archive"><FileArchive size={18} /></span><div><strong>Complete Resea package</strong><small>Student, instructor, assessment, research, data, quality + verified backup</small></div><Download size={15} /></button>
            <button className="export-option" onClick={() => onExport("markdown")}><span className="filetype md">MD</span><div><strong>Complete academic Markdown</strong><small>Student syllabus, instructor guide, evidence, quality, version history</small></div><Download size={15} /></button>
            <button className="export-option" onClick={() => onExport("json")}><span className="filetype json">{`{ }`}</span><div><strong>Canonical JSON envelope</strong><small>Objects, relations, provenance, renderer, quality + project checksum</small></div><Download size={15} /></button>
            <button className="export-option" onClick={() => onExport("csv")}><span className="filetype csv">CSV</span><div><strong>Detailed alignment map</strong><small>Conditions, criteria, concepts, modules, practice, assessment, provenance</small></div><Download size={15} /></button>
          </section>
          <section className="panel restore-card">
            <p className="eyebrow">Restore</p>
            <h2>Import a project</h2>
            <p>Resea validates the schema and bundle checksum before replacing the current working copy.</p>
            <button className="button secondary full" onClick={() => importRef.current?.click()}><Upload size={15} /> Choose .resea or JSON</button>
          </section>
        </aside>
      </div>
    </>
  );
}

function ContextPanel({ project, view, onClose }: { project: ProjectState; view: ViewId; onClose: () => void }) {
  const findings = runAudit(project);
  const summary = auditSummary(findings);
  const metrics = alignmentMetrics(project);
  const viewNote: Record<ViewId, { title: string; body: string }> = {
    brief: { title: "Decisions stay visible", body: "Defaults become assumptions with an owner and confidence. Approved fields are never silently overwritten." },
    research: { title: "A score is not credibility", body: "Triage signals help compare candidates. The instructor still reviews authority, scope, methods, date, access, and rights." },
    evidence: { title: "Claims are the trust unit", body: "A credible document can still be stale, misquoted, or out of scope. Inspect the exact locator before approval." },
    map: { title: "Backward design", body: "Outcomes precede weekly scheduling. Practice and assessment must directly elicit the approved capability." },
    build: { title: "Scoped generation", body: "Object-level changes preserve unrelated approved modules and keep their review history intact." },
    audit: { title: "Structure is not truth", body: "Deterministic checks reveal missing relationships. Subject correctness and assessment validity still require expert judgment." },
    refresh: { title: "No silent replacement", body: "Changed evidence produces an impact proposal; published versions remain immutable." },
    versions: { title: "Local is not permanent", body: "Export a .resea bundle after material changes. Browser profile data can be cleared by the browser or device." },
  };
  return (
    <aside className="context-panel">
      <div className="context-header"><span>Course health</span><button className="icon-button" onClick={onClose} aria-label="Close context panel"><PanelRightClose size={17} /></button></div>
      <div className="context-score">
        <div className={`score-dot ${summary.canPublish ? "pass" : "fail"}`}>{summary.canPublish ? <Check size={18} /> : summary.critical}</div>
        <div><strong>{summary.canPublish ? "No critical blockers" : "Publication blocked"}</strong><span>{findings.length} open finding{findings.length === 1 ? "" : "s"}</span></div>
      </div>
      <div className="context-metrics">
        <ProgressBar value={metrics.assessmentCoverage} label="Assessment coverage" />
        <ProgressBar value={metrics.practiceCoverage} label="Practice coverage" />
      </div>
      <div className="context-note"><div><ShieldCheck size={17} /><strong>{viewNote[view].title}</strong></div><p>{viewNote[view].body}</p></div>
      <div className="context-provenance">
        <p className="eyebrow">Provenance snapshot</p>
        <div><span>Approved sources</span><strong>{project.sources.filter((item) => item.reviewState === "approved").length}</strong></div>
        <div><span>Exact evidence units</span><strong>{project.evidence.length}</strong></div>
        <div><span>Qualified claims</span><strong>{project.claims.length}</strong></div>
        <div><span>Published versions</span><strong>{project.versions.length}</strong></div>
      </div>
      <div className="organizer-mode"><Sparkles size={16} /><div><strong>Organizer-only mode</strong><span>No model downloaded. Collection, mapping, audits, and exports remain available.</span></div></div>
    </aside>
  );
}

export default function Home() {
  const [project, setProject] = useState<ProjectState>(() => cloneSample());
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<ViewId>("brief");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [globalQuery, setGlobalQuery] = useState("");
  const [focusObjectId, setFocusObjectId] = useState<string | undefined>();
  const [toast, setToast] = useState("");
  const [saveState, setSaveState] = useState<"saving" | "saved">("saved");
  const [storageText, setStorageText] = useState("Local");
  const [knownProjects, setKnownProjects] = useState<ProjectState[]>([]);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3800);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const activeId = localStorage.getItem("resea-active-project") ?? "project-research-methods";
      const saved = await loadProject(activeId);
      if (!active) return;
      if (saved) setProject(saved);
      else {
        await saveProject(project);
        localStorage.setItem("resea-active-project", project.id);
      }
      setKnownProjects(await listProjects());
      const estimate = await storageEstimate();
      if (estimate?.quota) {
        const used = estimate.usage ?? 0;
        setStorageText(`${Math.max(0, Math.round(((estimate.quota - used) / 1024 / 1024) * 10) / 10).toLocaleString()} MB free`);
      }
      setHydrated(true);
    })();
    return () => { active = false; };
    // The initial project is a packaged fallback; loading happens once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      const next = { ...project, updatedAt: isoNow() };
      await saveProject(next);
      localStorage.setItem("resea-active-project", next.id);
      setKnownProjects(await listProjects());
      setSaveState("saved");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [project, hydrated]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setGlobalQuery("");
        setProjectMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const updateSpec = (patch: Partial<CourseSpec>) => {
    setProject((current) => ({
      ...current,
      title: patch.title ?? current.title,
      spec: {
        ...current.spec,
        ...patch,
        reviewState: current.spec.reviewState === "approved" ? "needs_review" : current.spec.reviewState,
      },
      updatedAt: isoNow(),
      events: [
        ...current.events,
        { id: uid("event"), at: isoNow(), action: "Brief revised", detail: `Updated ${Object.keys(patch).join(", ")}.` },
      ],
    }));
  };

  const approveBrief = () => {
    setProject((current) => ({
      ...current,
      lifecycle: "BRIEF_APPROVED",
      spec: { ...current.spec, reviewState: "approved" },
      events: [...current.events, { id: uid("event"), at: isoNow(), action: "Brief approved", detail: "Instructor approved the course context and constraints." }],
    }));
    notify("Brief approved. You can now propose a research plan.");
  };

  const resetProject = async (kind: "sample" | "blank") => {
    await saveProject({ ...project, updatedAt: isoNow() });
    const next = kind === "sample" ? createSampleProject() : createBlankProject();
    if (kind === "sample") {
      const baseTitle = next.spec.title;
      const copyNumber = Math.max(
        1,
        knownProjects.filter((item) => item.spec.title.startsWith(baseTitle)).length,
      );
      next.title = `${baseTitle} — Sample copy ${copyNumber}`;
      next.spec.title = next.title;
    }
    setProject(next);
    await saveProject(next);
    localStorage.setItem("resea-active-project", next.id);
    setKnownProjects(await listProjects());
    setProjectMenuOpen(false);
    setView("brief");
    setFocusObjectId(undefined);
    notify(kind === "sample" ? "A fresh sample course was added." : "New browser-local project created.");
  };

  const switchProject = async (projectId: string) => {
    if (projectId === project.id) {
      setProjectMenuOpen(false);
      setSidebarOpen(false);
      return;
    }
    await saveProject({ ...project, updatedAt: isoNow() });
    const next = await loadProject(projectId);
    if (!next) {
      notify("That local project is no longer available.");
      setKnownProjects(await listProjects());
      return;
    }
    setProject(next);
    localStorage.setItem("resea-active-project", next.id);
    setProjectMenuOpen(false);
    setSidebarOpen(false);
    setView("brief");
    setFocusObjectId(undefined);
    notify(`Opened ${next.spec.title}.`);
  };

  const handleExport = async (format: "markdown" | "json" | "csv" | "bundle") => {
    try {
      let exportedProject = project;
      if (format === "bundle") {
        exportedProject = { ...project, backupAt: isoNow(), updatedAt: isoNow() };
        setProject(exportedProject);
        await saveProject(exportedProject);
        setKnownProjects(await listProjects());
      }
      await exportProject(exportedProject, format);
      notify(format === "bundle" ? "Verified project backup downloaded." : `${format.toUpperCase()} export downloaded.`);
    } catch {
      notify("The export could not be created.");
    }
  };

  const importProject = async (file?: File) => {
    if (!file) return;
    try {
      const next = await importProjectFile(file);
      setProject(next);
      await saveProject(next);
      localStorage.setItem("resea-active-project", next.id);
      setKnownProjects(await listProjects());
      setFocusObjectId(undefined);
      notify("Project validated and restored.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "The project could not be imported.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const globalMatches = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];
    return [
      ...project.sources.map((source) => ({ id: source.id, type: "Source", label: source.title, view: "evidence" as ViewId })),
      ...project.claims.map((claim) => ({ id: claim.id, type: "Claim", label: claim.text, view: "evidence" as ViewId })),
      ...project.concepts.map((concept) => ({ id: concept.id, type: "Concept", label: concept.label, view: "map" as ViewId })),
      ...project.outcomes.map((outcome) => ({ id: outcome.id, type: outcome.code, label: `${outcome.action} ${outcome.object}`, view: "map" as ViewId })),
      ...project.modules.map((module) => ({ id: module.id, type: `Module ${module.order}`, label: module.title, view: "build" as ViewId })),
    ].filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [globalQuery, project]);

  if (!hydrated) {
    return <main className="loading-screen"><div className="loading-mark">R</div><p>Opening your local research workspace…</p></main>;
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <div className="brand-area">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
          <div className="brand-mark" aria-hidden>R</div>
          <div className="brand-copy"><strong>Resea</strong><span>Serious research for serious teaching</span></div>
        </div>
        <div className="project-selector">
          <span className="project-kicker">ACTIVE COURSE</span>
          <button aria-haspopup="menu" aria-expanded={projectMenuOpen} onClick={() => setProjectMenuOpen((open) => !open)}>{project.spec.title}<ChevronDown size={14} /></button>
          {projectMenuOpen ? (
            <div className="project-popover" role="menu" aria-label="Local courses">
              <div className="project-popover-heading"><span>Local courses</span><small>{knownProjects.length}</small></div>
              <div className="project-popover-list">
                {knownProjects.map((item) => (
                  <button role="menuitem" className={item.id === project.id ? "active" : ""} key={item.id} onClick={() => switchProject(item.id)}>
                    <span>{item.spec.title}</span>
                    <small>{item.id === project.id ? "Open now" : `Updated ${formatDate(item.updatedAt)}`}</small>
                    {item.id === project.id ? <Check size={14} /> : null}
                  </button>
                ))}
              </div>
              <div className="project-popover-actions">
                <button onClick={() => resetProject("blank")}><Plus size={14} /> New course</button>
                <button onClick={() => resetProject("sample")}><FolderOpen size={14} /> Add sample</button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="global-search">
          <Search size={16} aria-hidden />
          <input ref={searchRef} value={globalQuery} onChange={(e) => setGlobalQuery(e.target.value)} placeholder="Search this course…" aria-label="Search this course" />
          <kbd>⌘ K</kbd>
          {globalMatches.length ? (
            <div className="search-popover">
              {globalMatches.map((match, index) => (
                <button key={`${match.type}-${index}`} onClick={() => { setFocusObjectId(match.id); setView(match.view); setGlobalQuery(""); }}>
                  <span>{match.type}</span><strong>{match.label}</strong>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="top-status">
          <span className="save-status">{saveState === "saving" ? <Loader2 className="spin" size={14} /> : <CheckCircle2 size={14} />} {saveState === "saving" ? "Saving…" : "Saved locally"}</span>
          <button className="button export-button" onClick={() => handleExport("bundle")}><Download size={15} /> Back up</button>
        </div>
      </header>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-mobile-header"><strong>Navigate</strong><button className="icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <nav aria-label="Course workspace">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge =
              item.id === "research" ? project.researchPlan.questions.filter((q) => q.status === "gap").length :
              item.id === "evidence" ? project.evidence.filter((e) => e.reviewState !== "approved").length :
              item.id === "audit" ? runAudit(project).filter((f) => f.severity === "critical").length :
              item.id === "refresh" ? project.sources.filter((s) => s.nextCheck < isoNow().slice(0, 10)).length : 0;
            return (
              <button key={item.id} className={view === item.id ? "active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => { setFocusObjectId(undefined); setView(item.id); setSidebarOpen(false); }}>
                <Icon size={18} /><span>{item.label}</span>{badge ? <em>{badge}</em> : null}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-courses">
            <span>Your courses</span>
            {knownProjects.slice(0, 4).map((item) => (
              <button className={item.id === project.id ? "active" : ""} key={item.id} onClick={() => switchProject(item.id)}>
                <span>{item.spec.title}</span>{item.id === project.id ? <Check size={12} /> : null}
              </button>
            ))}
          </div>
          <div className="local-card"><HardDrive size={16} /><div><strong>{storageText}</strong><span>{project.backupAt ? `Backed up ${formatDate(project.backupAt)}` : "No project backup yet"}</span></div></div>
          <button className="sidebar-link" onClick={async () => notify((await requestDurableStorage()) ? "The browser granted persistent storage." : "Persistent storage was not granted; regular exports remain recommended.")}><Archive size={16} /> Request durable storage</button>
          <button className="sidebar-link" onClick={() => resetProject("blank")}><Plus size={16} /> New course</button>
          <button className="sidebar-link" onClick={() => resetProject("sample")}><FolderOpen size={16} /> Add sample course</button>
        </div>
      </aside>
      {sidebarOpen ? <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}

      <main id="main-content" className={`workspace ${contextOpen ? "" : "wide"}`}>
        {view === "brief" ? <BriefView project={project} updateSpec={updateSpec} approveBrief={approveBrief} /> : null}
        {view === "research" ? <ResearchView project={project} setProject={setProject} notify={notify} /> : null}
        {view === "evidence" ? <EvidenceView key={`${project.id}-${focusObjectId ?? "default"}`} project={project} setProject={setProject} focusObjectId={focusObjectId} /> : null}
        {view === "map" ? <MapView project={project} /> : null}
        {view === "build" ? <BuildView key={`${project.id}-${focusObjectId ?? "default"}`} project={project} setProject={setProject} notify={notify} focusObjectId={focusObjectId} /> : null}
        {view === "audit" ? <AuditView project={project} onNavigate={(nextView, objectId) => { setFocusObjectId(objectId); setView(nextView); }} /> : null}
        {view === "refresh" ? <RefreshView project={project} setProject={setProject} notify={notify} /> : null}
        {view === "versions" ? <VersionsView project={project} setProject={setProject} notify={notify} importRef={importRef} onExport={handleExport} /> : null}
      </main>

      {contextOpen ? <ContextPanel project={project} view={view} onClose={() => setContextOpen(false)} /> : <button className="open-context" onClick={() => setContextOpen(true)} aria-label="Open course health panel"><PanelRightClose size={17} /></button>}
      <input ref={importRef} className="visually-hidden" type="file" accept=".resea,.json,application/zip,application/json" onChange={(e) => importProject(e.target.files?.[0])} />
      {toast ? <div className="toast" role="status"><CheckCircle2 size={16} />{toast}</div> : null}
    </div>
  );
}
