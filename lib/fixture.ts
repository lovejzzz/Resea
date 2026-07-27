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
    catalogDescription:
      "An evidence-centered introduction to designing, evaluating, and communicating empirical social-science research. Students develop researchable questions, justify methods, examine ethics and validity, and produce a transparent research package.",
    rationale:
      "Students need more than procedural familiarity with methods: they need to connect questions, evidence, design choices, ethical responsibilities, and warranted claims. The course therefore uses backward design and repeated research decisions rather than a survey of disconnected techniques.",
    academicLevel: "Lower undergraduate",
    courseRole: "Major requirement",
    learnerProfile:
      "Second-year undergraduates from varied social-science majors, including students with limited prior research experience.",
    priorKnowledge:
      "College-level reading and writing; basic numeracy; no prior statistics course assumed.",
    prerequisites: "One introductory social science course (recommended)",
    diagnosticPlan:
      "In week 1, students annotate a short research claim, interpret a simple data display, and document prior experience with spreadsheets, citation, and research ethics. Results guide optional support without becoming a graded prerequisite test.",
    weeks: 14,
    sessionsPerWeek: 2,
    minutesPerSession: 75,
    independentMinutesPerWeek: 240,
    modality: "Blended",
    enrollment: 28,
    materialCostMax: 0,
    openOnly: true,
    accessibilityTarget: "WCAG 2.2 AA; accessible document formats",
    accessibilityStatement:
      "Course materials are provided in accessible digital formats. Students may use equivalent written, spoken, signed, or visual response pathways when the assessed construct is preserved. Learners should contact the instructor or institutional accessibility office early when another access path is needed.",
    academicIntegrityPolicy:
      "Students must distinguish their own reasoning from source material and disclose computational or generative assistance. Fabricated citations, unverifiable results, and undisclosed substitution of a tool for required analysis are not acceptable.",
    communicationPolicy:
      "The instructor acknowledges course questions within two working days. Formative work receives feedback before the next related high-stakes task; students may request clarification or an accessible feedback format.",
    requiredMaterials: [
      "A modern web browser and word-processing software",
      "A spreadsheet or equivalent accessible tabular-analysis tool",
      "Instructor-provided or openly licensed readings linked in each module",
    ],
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
      drivingQuestion:
        "What makes a social-science question researchable, and what can available evidence actually support?",
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
          preparation:
            "Read the question-quality guide and bring one broad issue that could be narrowed.",
          successIndicators: [
            "Names a population, setting, or bounded case",
            "Can be investigated with available evidence",
            "Separates the question from a preferred answer",
          ],
          accessibilityAlternatives: [
            "Written or spoken contribution",
            "Asynchronous critique window",
          ],
        },
      ],
      assessments: [],
      misconceptions: [
        "A broad social problem is already a research question",
        "A source is evidence for every claim related to its topic",
      ],
      connections:
        "Introduces the claim–evidence distinctions used in every later design, ethics, and analysis decision.",
      instructorNotes: [
        "Use low-stakes examples from multiple social-science traditions.",
        "Do not require students to commit to a final project topic in this module.",
      ],
      estimatedStudentMinutes: 315,
      reviewState: "approved",
    },
    {
      id: "module-2",
      order: 2,
      title: "Constructs, measurement, and validity",
      summary:
        "Operationalize constructs, select measures, and identify threats to the interpretations a study can support.",
      drivingQuestion:
        "How do definitions and measures shape the claims a study can responsibly make?",
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
          preparation:
            "Review the construct–measure worked example and identify one construct used in a source.",
          successIndicators: [
            "Distinguishes a construct from its operational measure",
            "Identifies included and excluded dimensions",
            "Connects a validity threat to a proposed interpretation",
          ],
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
          purpose:
            "Demonstrate that a research question, constructs, sampling approach, and measurement strategy form a coherent and appropriately qualified design.",
          task:
            "Propose and justify a question, construct definitions, sampling approach, and measurement strategy; disclose at least two limitations.",
          outcomeIds: ["outcome-1", "outcome-2"],
          expectedEvidence: [
            "A bounded research question",
            "Operational definitions for central constructs",
            "A justified sampling and measurement strategy",
            "At least two material validity limitations",
            "Traceable support for design claims",
          ],
          estimatedMinutes: 240,
          gradingMinutesPerStudent: 12,
          rubricCriteria: [
            "Question–design fit",
            "Construct clarity",
            "Evidence-based justification",
            "Limitations and scope",
          ],
          feedbackStrategy:
            "Criterion-referenced comments identify one strong design decision, one validity risk, and one required revision before the final package.",
          collaborationPolicy:
            "Peer discussion and question testing are permitted; each student submits and defends an independently authored memo.",
          sourcePolicy:
            "Cite all borrowed definitions and empirical claims using resolvable source links or course citation guidance.",
          toolPolicy:
            "Generative tools may assist brainstorming; the submitted rationale and source verification must be the student's own.",
          integrityNotes:
            "Students retain a brief decision log and must be able to explain every design choice and citation.",
          alignmentRationale:
            "The memo directly elicits CLO 1 through a bounded question and CLO 2 through a justified design and measurement strategy under stated constraints.",
          evaluatorGuidance:
            "Judge coherence and warranted scope rather than methodological sophistication alone. Do not reward technical vocabulary that is disconnected from the proposed question.",
          accessibilityAlternatives: [
            "Structured written memo or equivalent narrated briefing",
          ],
        },
      ],
      misconceptions: [
        "A familiar measure is automatically valid for a new population",
        "Reliability alone establishes that a measure captures the intended construct",
      ],
      connections:
        "Builds on bounded questions and prepares students to compare what different research designs can establish.",
      instructorNotes: [
        "Offer an accessible text alternative for every visual measurement example.",
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
      drivingQuestion:
        "Which design is fit for this question, and where must causal or general claims stop?",
      outcomeIds: ["outcome-2", "outcome-3"],
      conceptIds: ["concept-3"],
      sourceIds: ["source-4"],
      activities: [],
      assessments: [],
      misconceptions: [
        "Only experiments produce useful evidence",
        "A statistically adjusted association is automatically causal",
      ],
      connections:
        "Extends measurement reasoning into design choice and prepares students to assess ethical tradeoffs.",
      instructorNotes: [
        "This module intentionally retains a practice gap so the sample audit demonstrates a high-severity finding.",
      ],
      estimatedStudentMinutes: 360,
      reviewState: "needs_review",
    },
    {
      id: "module-4",
      order: 4,
      title: "Ethics, power, and responsible inquiry",
      summary:
        "Apply ethical principles while attending to institutional process, community context, power, and data stewardship.",
      drivingQuestion:
        "Who bears the risks and receives the benefits of a proposed study, and what changes are ethically required?",
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
          preparation:
            "Review the selected Belmont principles excerpt and the institution-specific review-process note.",
          successIndicators: [
            "Identifies affected stakeholders and power relationships",
            "Applies principles without treating them as a checklist",
            "Distinguishes classroom analysis from institutional approval",
          ],
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
          purpose:
            "Evaluate a proposed study through principled, contextual, and stakeholder-aware ethical reasoning without simulating formal institutional approval.",
          task:
            "Evaluate the ethical implications of a proposed study and recommend justified changes without claiming formal institutional approval.",
          outcomeIds: ["outcome-3"],
          expectedEvidence: [
            "A multi-perspective stakeholder analysis",
            "Reasoning tied to relevant ethical principles and context",
            "Feasible mitigations and their limitations",
            "Explicit unresolved tensions or information needs",
          ],
          estimatedMinutes: 180,
          gradingMinutesPerStudent: 14,
          rubricCriteria: [
            "Stakeholder analysis",
            "Principled reasoning",
            "Context and scope",
            "Feasible mitigations",
          ],
          feedbackStrategy:
            "The evaluator records criterion-level evidence and a short memo distinguishing required ethical revisions from context-dependent judgment.",
          collaborationPolicy:
            "Case deliberation may be collaborative; the final recommendation and justification must be individually attributable unless a group submission is explicitly assigned.",
          sourcePolicy:
            "Policy or ethical claims must cite the applicable source and jurisdiction; students must not present course analysis as legal or institutional approval.",
          toolPolicy:
            "Sources and any tool assistance must be disclosed; students remain responsible for all policy interpretations.",
          integrityNotes:
            "Invented institutional requirements or fabricated stakeholder testimony are prohibited. Uncertainty must remain visible.",
          alignmentRationale:
            "The task directly elicits CLO 3 by requiring students to evaluate risks, benefits, consent, power, and equitable treatment using guidance and stakeholder analysis.",
          evaluatorGuidance:
            "Reward reasoned attention to context and tensions. Do not score agreement with a single predetermined recommendation when alternatives are defensible.",
          accessibilityAlternatives: [
            "Written, audio, or signed response using the same evidence criteria",
          ],
        },
      ],
      misconceptions: [
        "Ethics approval is a one-time administrative checkbox",
        "Removing names always makes data harmless or anonymous",
      ],
      connections:
        "Applies earlier questions, measures, and design choices to responsibility and prepares the ethics note in the final package.",
      instructorNotes: [
        "Replace generic institutional-process language with the local policy before learner publication.",
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
      drivingQuestion:
        "What can this analysis support, what remains uncertain, and could another researcher reproduce the reasoning?",
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
          preparation:
            "Complete the file-organization checklist and verify that all shared materials may be distributed.",
          successIndicators: [
            "A peer can locate inputs, decisions, and outputs",
            "Dependencies and transformations are documented",
            "The revision log resolves or explains peer-reported issues",
          ],
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
          purpose:
            "Integrate the course outcomes in a bounded research product whose evidence, decisions, limitations, ethics, and reproducibility can be independently reviewed.",
          task:
            "Submit a bounded research product with question, methods rationale, data or evidence inventory, analysis, interpretation, limitations, ethics note, and reproducibility documentation.",
          outcomeIds: ["outcome-1", "outcome-2", "outcome-3", "outcome-4"],
          expectedEvidence: [
            "A bounded question and qualified rationale",
            "A coherent methods and measurement justification",
            "A source, data, or evidence inventory with reuse conditions",
            "Reproducible analysis materials and a decision log",
            "Interpretation separated from observed results",
            "Limitations, uncertainty, and an ethics note",
          ],
          estimatedMinutes: 720,
          gradingMinutesPerStudent: 25,
          rubricCriteria: [
            "Question and design coherence",
            "Evidence traceability",
            "Ethical reasoning",
            "Interpretive restraint",
            "Reproducibility and documentation",
          ],
          feedbackStrategy:
            "Students receive a milestone conference, a peer reproducibility report, and criterion-referenced final feedback with a prioritized revision path.",
          collaborationPolicy:
            "Peer testing and troubleshooting are expected and must be logged. The submitted reasoning and designated individual work remain attributable.",
          sourcePolicy:
            "Every borrowed claim, dataset, instrument, and adapted artifact must have a resolvable citation and a documented access or reuse condition.",
          toolPolicy:
            "All computational and generative assistance must be logged; unverified generated citations or results are prohibited.",
          integrityNotes:
            "The package must preserve original data or instructor-approved substitutes, analysis history, and disclosure of assistance. Results may not be fabricated or selectively replaced.",
          alignmentRationale:
            "The portfolio elicits all four outcomes through an inspectable chain from question and design to ethics, interpretation, and reproducible documentation.",
          evaluatorGuidance:
            "Prioritize traceability, coherence, ethical reasoning, and interpretive restraint. Technical complexity is not a substitute for a defensible evidence chain.",
          accessibilityAlternatives: [
            "Equivalent textual, visual, or narrated presentation layer",
            "Private data alternative supplied by instructor",
          ],
        },
      ],
      misconceptions: [
        "Reproducibility means obtaining the same conclusion rather than reproducing the recorded process",
        "A polished visualization can compensate for undocumented transformations",
      ],
      connections:
        "Synthesizes every earlier decision into the final research package and makes limitations visible for future revision.",
      instructorNotes: [
        "The sample workload intentionally exceeds the weekly budget; split this module across multiple weeks before learner publication.",
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
