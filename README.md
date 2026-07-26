# Resea

**Serious research for serious teaching.**

Resea is an evidence-first, browser-local workbench for designing defensible college courses. It helps an instructor move from a structured course brief to a research plan, source library, exact evidence, qualified claims, prerequisite-aware concepts, measurable outcomes, aligned modules, audits, immutable versions, and portable exports.

Resea is not a chat box that emits a syllabus. It is a course-design system in which the model may propose, deterministic software validates, and the instructor approves.

## What is implemented

The current pilot release includes:

- a structured course brief with visible assumptions and approval state;
- a bounded, domain-independent research planner;
- live browser-side scholarly discovery through OpenAlex;
- manual HTTPS source and exact-excerpt capture;
- a provenance-preserving source library, evidence desk, and citation inspector;
- explicit claims, concepts, prerequisites, outcomes, activities, assessments, rubrics, and workload;
- deterministic publication audits for citation integrity, alignment, cycles, risk review, licensing, freshness, accessibility, assessment policy, and workload;
- per-source freshness intervals and user-triggered metadata checks;
- immutable local version manifests with SHA-256 integrity hashes;
- Markdown, canonical JSON, alignment CSV, and checksummed `.resea` bundle exports;
- IndexedDB persistence, a durable-storage request, offline shell caching, and import/restore;
- organizer-only operation when no local model is installed;
- a Manifest V3 companion extension for narrow active-tab capture and optional per-host retrieval;
- a realistic social-science research methods fixture that demonstrates the full evidence-to-course path.

## Trust model

Resea has no account, application API, database server, search proxy, or hosted model. Canonical course state stays in the browser. Static hosting serves executable assets only.

The workbench makes several distinctions explicit:

- public access is not an open license;
- freshness is not truth;
- a source-level reputation signal is not proof that a claim is supported;
- model confidence is not evidence;
- structural audit completion is not disciplinary certification;
- an exported or published local version still requires instructor approval.

High-stakes and regulated course configurations trigger a critical publication blocker until a named expert review event exists.

## Run locally

Requirements: Node.js 22.13 or later.

```bash
npm install
npm run dev
```

The preview opens on `http://localhost:3000`.

Run the complete release gate:

```bash
npm run check
```

This performs strict type checking, linting, deterministic tests, browser-only and secret invariants, and a production build.

## Browser extension

The optional extension lives in `apps/extension`. It requests only `activeTab`, scripting, local extension storage, and side-panel permissions at install time. Cross-origin reach is optional and requested per host during a user-approved retrieval.

Prepare an unpacked extension directory:

```bash
npm run extension:package
```

Then load `dist-extension` as an unpacked extension in a Chromium-based browser. The capture side panel extracts inert main text, headings, metadata, URL, title, and extraction-version information. It omits scripts, forms, frames, navigation, cookies, history, and form values.

## Project structure

```text
app/                  Browser workbench and product UI
lib/                  Domain types, audit rules, storage, research, exports
apps/extension/       Optional Manifest V3 capture companion
tests/                Domain, security, persistence, and export tests
scripts/              Release and extension packaging checks
docs/                 Architecture, academic-quality, and threat-model notes
public/               PWA manifest and offline shell worker
worker/               Static hosting entry point only
```

Business rules live outside UI components. External endpoint access is isolated in `lib/research.ts`; browser persistence is isolated in `lib/storage.ts`; deterministic academic checks are isolated in `lib/audit.ts`.

## Academic-quality workflow

1. Approve the learner, course-role, time, modality, access, and risk constraints.
2. Review a bounded research plan before search.
3. Assemble a source-diverse set and inspect authority, scope, date, access, and rights.
4. Preserve exact evidence and a resolvable locator before creating substantive claims.
5. Separate sourced facts, synthesis, pedagogical inference, and instructor decisions.
6. Build prerequisite-aware concepts and observable outcomes.
7. Map each required outcome to feedback-bearing practice and a valid assessment.
8. Run deterministic audits; resolve critical blockers and record remaining review needs.
9. Publish an immutable local manifest and export a checksummed backup.
10. Refresh sources through explicit proposals; never silently replace approved course content.

The included fixture intentionally retains non-critical review findings. A realistic academic workflow should surface uncertainty and unfinished judgment rather than manufacture a perfect score.

## Current boundaries

- Organizer-only mode is the default. A browser-local inference adapter is an intentionally replaceable future package; no remote AI dependency is hidden in the app.
- OpenAlex supplies discovery metadata, not full-text retrieval or credibility decisions.
- Direct page capture in the PWA remains subject to CORS. The extension or instructor-provided excerpts are the transparent recovery paths.
- PDF, DOCX, and LMS-oriented rendering are not in this pilot. Markdown and JSON are authoritative.
- Collaboration and centralized administration are out of scope for the zero-backend release.
- Browser profile storage is not permanent. Export `.resea` bundles after material work.

## Responsible use

Resea supports undergraduate, non-clinical, English-language course planning in its first release. It does not accredit, certify, or autonomously publish clinical, legal, aviation, safety-critical, or regulated instruction. Instructors remain responsible for disciplinary correctness, institutional policy, accessibility review, source use, and learner-facing publication.

No open-source license has been granted in this repository yet.
