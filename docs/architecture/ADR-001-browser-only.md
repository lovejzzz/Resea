# ADR-001: Browser-only system of record

- Status: accepted
- Date: 2026-07-26

## Decision

Resea uses a zero-owned-backend architecture. IndexedDB stores canonical structured objects; the browser cache stores the offline shell; `.resea` bundles provide portable backup. Static hosting serves the application bundle but owns no course data. The companion extension expands retrieval reach without becoming a system of record.

## Consequences

The product can open, edit, audit, version, and export a course without an account or Resea server. Users retain control and can work offline after caching.

The product cannot promise unattended refresh while the browser is closed, centralized collaboration, or recovery after browser-profile deletion without a user export. The UI therefore exposes local save state, storage durability, backup status, degraded research modes, and exact freshness dates.

## Boundary enforcement

`scripts/verify-release.mjs` rejects application API surfaces, hosted D1/R2 bindings, install-time extension host permissions, and credential-like strings. CI runs this check on every proposed change.
