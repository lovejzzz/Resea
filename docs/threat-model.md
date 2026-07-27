# Threat model

## Protected assets

- canonical course objects and approved versions;
- imported or captured source content;
- source and claim provenance;
- user-supplied connector credentials, if added later;
- integrity of audits and exports;
- user understanding of what left the device.

## Trust boundaries

Remote pages, API responses, uploaded files, source excerpts, and model output are untrusted data. They cannot define system instructions, approve objects, execute code, widen permissions, or mutate published versions.

Static application code, deterministic validation, and explicit instructor actions form the control boundary. The optional extension has a narrow protocol and validates HTTPS targets, private-network exclusions, byte limits, MIME types, redirects, and user-granted origins.

## Implemented controls

- no application backend or credential-bearing proxy;
- no install-time extension host permission;
- `activeTab` capture only after a user gesture;
- removal of scripts, frames, forms, styles, navigation, and hidden elements from capture;
- no cookie, browsing-history, or form-value collection;
- HTTPS-only source entry and private-network URL blocking;
- OpenAlex adapter returns metadata as `needs_review`;
- unknown licenses allow linking only by default;
- exact evidence kept separate from annotations;
- schema and SHA-256 validation on project restore;
- immutable local version hashes;
- no raw HTML insertion into the Resea interface;
- Content Security Policy in the extension;
- release scan for credential-like tokens and owned-backend surfaces.

## Residual risks

Browser extensions and local storage inherit the security of the user’s browser profile and device. CORS and provider terms can limit retrieval. Main-content extraction can omit context. Metadata can be wrong. Checksums detect accidental or malicious modification but do not authenticate the original author. Instructors must inspect exact source context and keep external backups appropriate to source rights.
