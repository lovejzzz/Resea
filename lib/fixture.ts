import type { ProjectState } from "./types";

const now = "2026-07-26T14:00:00.000Z";

export const sampleProject: ProjectState = {
  schemaVersion: "1.0.0",
  id: "project-research-methods",
  title: "Research Methods for the Social Sciences",
  createdAt: now,
  updatedAt: now,
  lifecycle: "DESIGN_DRAFT",
  spec: {
    id: "spec-1",
    title: "Research Methods for the Social Sciences",
    subject: "Empirical social science research",
    academicLevel: "Lower undergraduate",
    courseRole: "Major requirement",
    learnerProfile:
      "Second-year undergraduates from varied social-science majors, including students with limited prior research experience.",
    priorKnowledge:
      "College-level reading and writing; basic numeracy; no prior statistics course assumed.",
    prerequisites: "One introductory social science course (recommended)",
    weeks: 14,
    sessionsPerWeek: 2,
    minutesPerSession: 75,
    independentMinutesPerWeek: 240,
    modality: "Blended",
    enrollment: 28,
    materialCostMax: 0,
    openOnly: true,
    accessibilityTarget: "WCAG 2.2 AA; accessible document formats",
    riskTier: "general",
    jurisdiction: "United States higher education",
    reviewState: "approved",
  },
  assumptions: [
    {
      id: "assumption-1",
      statement:
        "Students can use a spreadsheet but have not learned inferential statistics.",
      rationale:
        "The prerequisite does not establish a common quantitative background.",
      owner: "Instructor",
      confidence: "medium",
      status: "open",
    },
    {
      id: "assumption-2",
      statement:
        "The institution provides access to a research ethics review process.",
      rationale:
        "Human-subjects activities require institution-specific oversight.",
      owner: "Program",
      confidence: "high",
      status: "open",
    },
  ],
  researchPlan: {
    id: "plan-1",
    status: "approved",
    desiredSourceCategories: [
      "Official guidance",
      "Primary research",
      "Scholarly synthesis",
      "Open educational resources",
      "Pedagogical research",
    ],
    inclusionRules: [
      "Prefer current, authoritative, and openly accessible sources",
      "Retain exact locators for every substantive claim",
      "Represent quantitative, qualitative, and mixed-methods traditions",
    ],
    stoppingConditions: [
      "Every approved outcome has evidence coverage",
      "Every core concept has an appropriate source",
      "Critical contradictions are resolved or disclosed",
      "The instructor approves remaining limitations",
    ],
    maxSources: 25,
    questions: [
      {
        id: "rq-1",
        family: "Canonical coverage",
        question:
          "Which capabilities recur across credible undergraduate social-science research methods curricula?",
        rationale:
          "Establishes defensible breadth without copying a single syllabus.",
        priority: "core",
        status: "sufficient",
        queries: [
          '"social science research methods" undergraduate learning outcomes',
          "research methods open textbook social sciences",
        ],
      },
      {
        id: "rq-2",
        family: "Disciplinary methods",
        question:
          "What practices distinguish transparent, ethical, and reproducible empirical inquiry?",
        rationale:
          "Connects method selection to responsible practice.",
        priority: "core",
        status: "approved",
        queries: [
          "transparent reproducible social science research practices",
          "research ethics informed consent undergraduate methods",
        ],
      },
      {
        id: "rq-3",
        family: "Access and inclusion",
        question:
          "Which design choices make research activities and materials accessible to varied learners?",
        rationale:
          "Treats access as a course constraint rather than an export afterthought.",
        priority: "supporting",
        status: "approved",
        queries: [
          "universal design for learning research methods course",
          "accessible data visualization guidance",
        ],
      },
    ],
  },
  sources: [
    {
      id: "source-1",
      title: "The Belmont Report",
      authors: ["National Commission for the Protection of Human Subjects"],
      publisher: "U.S. Department of Health and Human Services",
      canonicalUrl:
        "https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html",
      sourceType: "Normative / official",
      publishedAt: "1979-04-18",
      addedAt: now,
      access: "public",
      license: "unknown",
      allowedActions: ["link", "quote"],
      volatility: "slow",
      lastChecked: "2026-07-26",
      nextCheck: "2027-01-22",
      reviewState: "approved",
      researchQuestionIds: ["rq-2"],
      score: 92,
      rationale:
        "Foundational U.S. ethical framework; used with explicit jurisdictional scope.",
    },
    {
      id: "source-2",
      title: "The FAIR Guiding Principles for scientific data management and stewardship",
      authors: ["Mark D. Wilkinson", "Michel Dumontier", "et al."],
      publisher: "Scientific Data",
      canonicalUrl: "https://doi.org/10.1038/sdata.2016.18",
      sourceType: "Primary / consensus",
      publishedAt: "2016-03-15",
      addedAt: now,
      access: "open_access",
      license: "open_license",
      licenseLabel: "CC BY 4.0",
      allowedActions: ["link", "quote", "retain_private", "adapt", "redistribute"],
      volatility: "stable",
      lastChecked: "2026-07-26",
      nextCheck: "2027-07-26",
      reviewState: "approved",
      researchQuestionIds: ["rq-2"],
      score: 89,
      rationale:
        "Peer-reviewed, openly licensed articulation of reusable data stewardship principles.",
    },
    {
      id: "source-3",
      title: "Universal Design for Learning Guidelines 3.0",
      authors: ["CAST"],
      publisher: "CAST",
      canonicalUrl: "https://udlguidelines.cast.org/",
      sourceType: "Pedagogical guidance",
      publishedAt: "2024-07-30",
      addedAt: now,
      access: "public",
      license: "open_license",
      licenseLabel: "CC BY-SA 4.0",
      allowedActions: ["link", "quote", "adapt", "redistribute"],
      volatility: "moderate",
      lastChecked: "2026-07-26",
      nextCheck: "2026-10-24",
      reviewState: "approved",
      researchQuestionIds: ["rq-3"],
      score: 86,
      rationale:
        "Current design framework used as pedagogical guidance, not as subject-matter evidence.",
    },
    {
      id: "source-4",
      title: "Introduction to Social Science Research Methods",
      authors: ["Anol Bhattacherjee"],
      publisher: "University of South Florida Libraries",
      canonicalUrl: "https://digitalcommons.usf.edu/oa_textbooks/3/",
      sourceType: "Open textbook",
      publishedAt: "2012-01-01",
      addedAt: now,
      access: "open_access",
      license: "open_license",
      licenseLabel: "CC BY-NC-SA",
      allowedActions: ["link", "quote", "retain_private", "adapt"],
      volatility: "slow",
      lastChecked: "2026-07-26",
      nextCheck: "2027-01-22",
      reviewState: "approved",
      researchQuestionIds: ["rq-1"],
      score: 82,
      rationale:
        "Accessible curricular synthesis; corroborated rather than treated as a sole authority.",
    },
  ],
  evidence: [
    {
      id: "evidence-1",
      sourceId: "source-1",
      locator: "Part B, Basic Ethical Principles",
      headingPath: ["Part B", "Basic Ethical Principles"],
      exactText:
        "Three basic principles, among those generally accepted in our cultural tradition, are particularly relevant to the ethics of research involving human subjects: the principles of respect of persons, beneficence and justice.",
      annotation:
        "Supports explicit ethical reasoning in human-subjects research; scope is U.S. policy history.",
      claimTypes: ["normative", "definitional"],
      qualityFlags: [],
      reviewState: "approved",
    },
    {
      id: "evidence-2",
      sourceId: "source-2",
      locator: "Abstract, paragraph 1",
      headingPath: ["Abstract"],
      exactText:
        "The FAIR Principles put specific emphasis on enhancing the ability of machines to automatically find and use the data, in addition to supporting its reuse by individuals.",
      annotation:
        "Supports data-management criteria while retaining the paper’s machine-actionability emphasis.",
      claimTypes: ["factual", "procedural"],
      qualityFlags: [],
      reviewState: "approved",
    },
    {
      id: "evidence-3",
      sourceId: "source-3",
      locator: "Guideline: Design Multiple Means of Action & Expression",
      headingPath: ["Action & Expression"],
      exactText:
        "Design multiple options for action and expression so all learners can demonstrate what they know.",
      annotation:
        "Pedagogical design prompt; assessment alternatives must preserve the construct.",
      claimTypes: ["pedagogical"],
      qualityFlags: ["paraphrase-on-source-interface"],
      reviewState: "needs_review",
    },
    {
      id: "evidence-4",
      sourceId: "source-4",
      locator: "Chapter 2, Thinking Like a Researcher",
      headingPath: ["Thinking Like a Researcher"],
      exactText:
        "Scientific research must meet certain specific criteria, including that its purpose is to answer a question and that it follows a systematic method.",
      annotation:
        "Curricular synthesis for framing inquiry; requires corroboration for strong factual claims.",
      claimTypes: ["definitional"],
      qualityFlags: [],
      reviewState: "approved",
    },
  ],
  claims: [
    {
      id: "claim-1",
      type: "procedural",
      text:
        "Students planning human-subjects research should explicitly address respect for persons, beneficence, and justice within the applicable institutional and jurisdictional review process.",
      supportingEvidenceIds: ["evidence-1"],
      contradictingEvidenceIds: [],
      inference: "synthesis",
      reviewState: "approved",
    },
    {
      id: "claim-2",
      type: "procedural",
      text:
        "A defensible data-management plan should make research objects findable, accessible under stated conditions, interoperable, and reusable.",
      supportingEvidenceIds: ["evidence-2"],
      contradictingEvidenceIds: [],
      inference: "synthesis",
      reviewState: "approved",
    },
    {
      id: "claim-3",
      type: "pedagogical",
      text:
        "Course activities should provide more than one accessible route for students to demonstrate learning when alternatives preserve the intended construct.",
      supportingEvidenceIds: ["evidence-3"],
      contradictingEvidenceIds: [],
      inference: "pedagogical_inference",
      reviewState: "needs_review",
    },
  ],
  concepts: [
    {
      id: "concept-1",
      label: "Researchable questions",
      definition:
        "Questions bounded enough to be investigated using evidence and an appropriate design.",
      role: "core",
      prerequisiteIds: [],
      claimIds: ["claim-1"],
      outcomeIds: ["outcome-1"],
      reviewState: "approved",
    },
    {
      id: "concept-2",
      label: "Constructs and measurement",
      definition:
        "The relationship among theoretical concepts, operational definitions, and observations.",
      role: "core",
      prerequisiteIds: ["concept-1"],
      claimIds: [],
      outcomeIds: ["outcome-2"],
      reviewState: "approved",
    },
    {
      id: "concept-3",
      label: "Research design",
      definition:
        "A coherent plan connecting a question, evidence, sampling, measurement, and analysis.",
      role: "core",
      prerequisiteIds: ["concept-1", "concept-2"],
      claimIds: ["claim-1"],
      outcomeIds: ["outcome-2", "outcome-3"],
      reviewState: "approved",
    },
    {
      id: "concept-4",
      label: "Research ethics",
      definition:
        "Principled identification and mitigation of harms, power imbalances, and unfair burdens or benefits.",
      role: "core",
      prerequisiteIds: ["concept-1"],
      claimIds: ["claim-1"],
      outcomeIds: ["outcome-3"],
      reviewState: "approved",
    },
    {
      id: "concept-5",
      label: "Transparent data stewardship",
      definition:
        "Documenting, organizing, and sharing research objects under explicit access and reuse conditions.",
      role: "supporting",
      prerequisiteIds: ["concept-3"],
      claimIds: ["claim-2"],
      outcomeIds: ["outcome-4"],
      reviewState: "approved",
    },
  ],
  outcomes: [
    {
      id: "outcome-1",
      code: "CLO 1",
      action: "Formulate",
      object:
        "a researchable social-science question and a qualified rationale",
      conditions: "Given a broad social issue and an initial source set",
      criteria:
        "The question is bounded, empirically tractable, and its assumptions are visible",
      conceptIds: ["concept-1"],
      activityIds: ["activity-1"],
      assessmentIds: ["assessment-1"],
      provenanceClaimIds: ["claim-1"],
      reviewState: "approved",
    },
    {
      id: "outcome-2",
      code: "CLO 2",
      action: "Select and justify",
      object: "a research design and measurement strategy",
      conditions: "For a stated question, population, and practical constraint",
      criteria:
        "The design fits the question and identifies validity threats and limitations",
      conceptIds: ["concept-2", "concept-3"],
      activityIds: ["activity-2"],
      assessmentIds: ["assessment-1"],
      provenanceClaimIds: [],
      reviewState: "approved",
    },
    {
      id: "outcome-3",
      code: "CLO 3",
      action: "Evaluate",
      object: "the ethical implications of a proposed empirical study",
      conditions:
        "Using relevant institutional guidance and an explicit stakeholder analysis",
      criteria:
        "Risks, benefits, consent, power, and equitable treatment are substantively addressed",
      conceptIds: ["concept-3", "concept-4"],
      activityIds: ["activity-3"],
      assessmentIds: ["assessment-2"],
      provenanceClaimIds: ["claim-1"],
      reviewState: "approved",
    },
    {
      id: "outcome-4",
      code: "CLO 4",
      action: "Create",
      object: "a transparent and reproducible research package",
      conditions: "Given a small public or instructor-provided dataset",
      criteria:
        "Materials are documented, organized, appropriately licensed, and reproducible by a peer",
      conceptIds: ["concept-5"],
      activityIds: ["activity-4"],
      assessmentIds: ["assessment-3"],
      provenanceClaimIds: ["claim-2"],
      reviewState: "approved",
    },
  ],
  modules: [
    {
      id: "module-1",
      order: 1,
      title: "Questions, evidence, and claims",
      summary:
        "Move from broad interests to bounded questions and distinguish observations, evidence, claims, and decisions.",
      outcomeIds: ["outcome-1"],
      conceptIds: ["concept-1"],
      sourceIds: ["source-4"],
      activities: [
        {
          id: "activity-1",
          title: "Question clinic",
          type: "Structured peer critique",
          instructions:
            "Diagnose the scope, constructs, population, and feasibility of three candidate questions; revise one and record the decisions.",
          outcomeIds: ["outcome-1"],
          estimatedMinutes: 55,
          feedback: "Peer protocol followed by instructor sampling",
          accessibilityAlternatives: [
            "Written or spoken contribution",
            "Asynchronous critique window",
          ],
        },
      ],
      assessments: [],
      estimatedStudentMinutes: 315,
      reviewState: "approved",
    },
    {
      id: "module-2",
      order: 2,
      title: "Constructs, measurement, and validity",
      summary:
        "Operationalize constructs, select measures, and identify threats to the interpretations a study can support.",
      outcomeIds: ["outcome-2"],
      conceptIds: ["concept-2"],
      sourceIds: ["source-4"],
      activities: [
        {
          id: "activity-2",
          title: "Measurement audit",
          type: "Case analysis",
          instructions:
            "Trace one published construct from definition to measure and identify what the operationalization includes and omits.",
          outcomeIds: ["outcome-2"],
          estimatedMinutes: 70,
          feedback: "Annotated exemplar and instructor conference",
          accessibilityAlternatives: [
            "Text-first case packet",
            "Screen-reader-ready data table",
          ],
        },
      ],
      assessments: [
        {
          id: "assessment-1",
          title: "Research design memo",
          type: "Analytical memo",
          stakes: "formative",
          task:
            "Propose and justify a question, construct definitions, sampling approach, and measurement strategy; disclose at least two limitations.",
          outcomeIds: ["outcome-1", "outcome-2"],
          estimatedMinutes: 240,
          gradingMinutesPerStudent: 12,
          rubricCriteria: [
            "Question–design fit",
            "Construct clarity",
            "Evidence-based justification",
            "Limitations and scope",
          ],
          toolPolicy:
            "Generative tools may assist brainstorming; the submitted rationale and source verification must be the student's own.",
          accessibilityAlternatives: [
            "Structured written memo or equivalent narrated briefing",
          ],
        },
      ],
      estimatedStudentMinutes: 410,
      reviewState: "approved",
    },
    {
      id: "module-3",
      order: 3,
      title: "Design choices and causal reasoning",
      summary:
        "Compare experimental, observational, qualitative, and mixed-methods designs by the claims each can support.",
      outcomeIds: ["outcome-2", "outcome-3"],
      conceptIds: ["concept-3"],
      sourceIds: ["source-4"],
      activities: [],
      assessments: [],
      estimatedStudentMinutes: 360,
      reviewState: "needs_review",
    },
    {
      id: "module-4",
      order: 4,
      title: "Ethics, power, and responsible inquiry",
      summary:
        "Apply ethical principles while attending to institutional process, community context, power, and data stewardship.",
      outcomeIds: ["outcome-3"],
      conceptIds: ["concept-4"],
      sourceIds: ["source-1"],
      activities: [
        {
          id: "activity-3",
          title: "Ethics deliberation",
          type: "Structured case conference",
          instructions:
            "Analyze a study scenario from participant, community, researcher, and institutional perspectives; propose mitigations and identify unresolved tensions.",
          outcomeIds: ["outcome-3"],
          estimatedMinutes: 75,
          feedback: "Decision memo compared with a multi-perspective exemplar",
          accessibilityAlternatives: [
            "Advance access to cases",
            "Written participation pathway",
          ],
        },
      ],
      assessments: [
        {
          id: "assessment-2",
          title: "Ethics and stakeholder review",
          type: "Case analysis",
          stakes: "summative",
          task:
            "Evaluate the ethical implications of a proposed study and recommend justified changes without claiming formal institutional approval.",
          outcomeIds: ["outcome-3"],
          estimatedMinutes: 180,
          gradingMinutesPerStudent: 14,
          rubricCriteria: [
            "Stakeholder analysis",
            "Principled reasoning",
            "Context and scope",
            "Feasible mitigations",
          ],
          toolPolicy:
            "Sources and any tool assistance must be disclosed; students remain responsible for all policy interpretations.",
          accessibilityAlternatives: [
            "Written, audio, or signed response using the same evidence criteria",
          ],
        },
      ],
      estimatedStudentMinutes: 380,
      reviewState: "approved",
    },
    {
      id: "module-5",
      order: 5,
      title: "Analysis, interpretation, and uncertainty",
      summary:
        "Choose bounded analytic approaches, separate result from interpretation, and communicate uncertainty without overstating evidence.",
      outcomeIds: ["outcome-2", "outcome-4"],
      conceptIds: ["concept-3", "concept-5"],
      sourceIds: ["source-2"],
      activities: [
        {
          id: "activity-4",
          title: "Reproducibility exchange",
          type: "Peer replication",
          instructions:
            "Exchange a small analysis package with a peer, reproduce the result, and file an issue for every undocumented dependency or decision.",
          outcomeIds: ["outcome-4"],
          estimatedMinutes: 95,
          feedback: "Peer issue report and self-correction log",
          accessibilityAlternatives: [
            "Keyboard-operable spreadsheet pathway",
            "Low-bandwidth package download",
          ],
        },
      ],
      assessments: [
        {
          id: "assessment-3",
          title: "Transparent research package",
          type: "Portfolio",
          stakes: "summative",
          task:
            "Submit a bounded research product with question, methods rationale, data or evidence inventory, analysis, interpretation, limitations, ethics note, and reproducibility documentation.",
          outcomeIds: ["outcome-1", "outcome-2", "outcome-3", "outcome-4"],
          estimatedMinutes: 720,
          gradingMinutesPerStudent: 25,
          rubricCriteria: [
            "Question and design coherence",
            "Evidence traceability",
            "Ethical reasoning",
            "Interpretive restraint",
            "Reproducibility and documentation",
          ],
          toolPolicy:
            "All computational and generative assistance must be logged; unverified generated citations or results are prohibited.",
          accessibilityAlternatives: [
            "Equivalent textual, visual, or narrated presentation layer",
            "Private data alternative supplied by instructor",
          ],
        },
      ],
      estimatedStudentMinutes: 825,
      reviewState: "approved",
    },
  ],
  findings: [],
  versions: [],
  events: [
    {
      id: "event-1",
      at: now,
      action: "Sample created",
      detail:
        "Loaded a packaged fixture to demonstrate the evidence-to-curriculum workflow.",
    },
  ],
};
