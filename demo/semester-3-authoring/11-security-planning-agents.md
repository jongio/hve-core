# Module 11: Security Planning Agents

## Episode 11 | Semester 3: Authoring and Customization

### Learning Objectives

- Describe the Security Planner's six-phase STRIDE threat modeling workflow and its operational bucket architecture
- Explain how the RAI Planner maps NIST AI RMF 1.0 functions across its six assessment phases
- Trace the SSSC Planner's supply chain security assessment through OpenSSF Scorecard, SLSA, and Sigstore standards
- Identify the shared phased workflow architecture, state persistence, and disclaimer patterns across all three planners
- Configure dual-format backlog handoff for both Azure DevOps and GitHub Issues

### Narration Script

#### Intro

The security collection deploys three specialized planning agents—Security Planner, RAI Planner, and SSSC Planner—each targeting a different security domain but sharing a common phased workflow architecture. All three use six-phase workflows with persistent JSON state, question-gated phase transitions, and dual-format backlog output. This module examines each planner's domain-specific framework mappings, then surfaces the shared architectural patterns that make the three agents composable.

#### Objectives

Module 11 covers the Security Planner's STRIDE threat modeling against OWASP and NIST 800-53, the RAI Planner's Responsible AI assessment against NIST AI RMF 1.0, the SSSC Planner's supply chain security evaluation against OpenSSF Scorecard and SLSA, the shared workflow architecture that unifies all three, and the dual-format backlog handoff that bridges planning into implementation.

#### Content: Security Planner — STRIDE Threat Modeling

The Security Planner agent (`security-planner.agent.md`) implements a six-phase workflow for application security planning, anchored in STRIDE threat modeling.

**Phase 1: Scoping** establishes the security assessment boundary. The agent asks 3 to 5 questions per turn to identify the system under analysis, its trust boundaries, data flows, and deployment context. Scoping is question-gated—the agent does not advance until it has sufficient context to perform meaningful threat analysis.

**Phase 2: Bucket Analysis** organizes the system into operational buckets—logical groupings of functionality that share security characteristics. The bucket structure defined in `operational-buckets.instructions.md` maps each bucket to relevant STRIDE threat categories and establishes the risk surface for subsequent phases.

**Phase 3: Standards Mapping** aligns the identified buckets against security standards. The `standards-mapping.instructions.md` file references OWASP Top 10, NIST 800-53 controls, and CIS Benchmarks. Each bucket receives a standards mapping that identifies applicable controls and compliance requirements. For broader architectural standards like the Well-Architected Framework and Cloud Adoption Framework, the planner delegates to the Researcher Subagent rather than maintaining those mappings internally.

**Phase 4: Security Model Analysis** performs the core STRIDE threat modeling. For each operational bucket, the agent systematically evaluates Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege threats. Threats receive structured identifiers: `T-{BUCKET}-{NNN}` for standard threats and `T-{BUCKET}-AI-{NNN}` for AI-specific threat overlaps. The `security-model.instructions.md` file defines the threat identification protocol, risk matrix, and the mapping between buckets and their primary STRIDE focus areas.

**Phase 5: Backlog Generation** transforms the threat model into actionable work items. Each identified threat produces one or more backlog items with mitigation strategies, acceptance criteria, and priority assignments.

**Phase 6: Review and Handoff** consolidates the security plan for stakeholder review and transitions to implementation. The agent presents the complete threat model, standards mappings, and generated backlog for confirmation before finalizing.

The Security Planner declares three handoff targets: the RAI Planner for AI-specific risk assessment and the SSSC Planner for supply chain security. These handoffs are defined in the agent's frontmatter, enabling direct transitions between complementary security domains. The agent uses a single subagent—the Researcher Subagent—for framework lookups and evolving standards research. Its tool grants include `read`, `edit`, `execute/runInTerminal`, `search`, `web`, and `agent`.

Every Security Planner session begins with a mandatory CAUTION disclaimer block, sourced from `shared/disclaimer-language.instructions.md`. This disclaimer states explicitly that the agent is an assistive tool, does not replace professional security tooling (SAST, DAST, SCA, penetration testing), and that all outputs must be reviewed by qualified security professionals.

#### Content: RAI Planner — NIST AI RMF Assessment

The RAI Planner agent (`rai-planner.agent.md`) targets Responsible AI risk assessment. Its six-phase workflow maps directly to the NIST AI Risk Management Framework 1.0 functions: Govern, Map, Measure, and Manage.

**Phase 1: AI System Scoping** aligns with the Govern and Map functions. The agent establishes the AI system's purpose, capabilities, intended users, deployment context, and data sources. It identifies whether the system involves supervised learning, generative AI, autonomous decision-making, or other AI modalities that carry distinct risk profiles.

**Phase 2: Risk Classification** maps to the Govern function. The agent evaluates the system against three risk indicator dimensions: `safety_reliability`, `rights_fairness_privacy`, and `security_explainability`. These dimensions map to the NIST AI RMF trustworthiness characteristics, which include accountability, explainability, fairness, privacy, reliability, robustness, safety, security, and transparency.

**Phase 3: RAI Standards Mapping** aligns with Govern and Measure. The agent maps identified risks to the NIST AI RMF function taxonomy, identifying which Govern subcategories apply to organizational controls, which Measure subcategories apply to quantifiable risk indicators, and which regulatory frameworks (EU AI Act, local regulations) introduce additional requirements.

**Phase 4: RAI Security Model Analysis** maps to the Measure function. This phase focuses on AI-specific threat vectors: data poisoning, adversarial evasion, prompt injection, output manipulation, bias amplification, privacy leakage, and misuse escalation. Threats receive dual identifiers—`T-RAI-{NNN}` for RAI-specific threats and `T-{BUCKET}-AI-{NNN}` when they overlap with the Security Planner's threat model. This dual-ID system enables cross-referencing between the two planners without duplicating analysis.

**Phase 5: RAI Impact Assessment** aligns with the Manage function. The agent evaluates the cumulative impact of identified risks across stakeholder groups, assessing potential harms to individuals, communities, and organizations. The `rai-impact-assessment.instructions.md` file defines the assessment methodology and harm taxonomy.

**Phase 6: Review and Handoff** also maps to Manage. The agent presents the complete RAI assessment—risk classification, standards mapping, threat model, and impact assessment—for stakeholder review and produces the implementation backlog.

The RAI Planner supports three entry modes: `capture` (interactive scoping from scratch), `from-prd` (pre-populating from a product requirements document), and `from-security-plan` (inheriting context from an existing Security Planner output). The `from-security-plan` entry mode is the most common production path—teams typically run the Security Planner first, then hand off to the RAI Planner for AI-specific risk assessment, carrying forward the existing threat model and bucket structure.

The `rai-capture-coaching.instructions.md` file defines the coaching interaction model—a maximum of 7 questions per turn with checklist-driven progress tracking using ❓, ✅, and ❌ emoji indicators.

#### Content: SSSC Planner — Supply Chain Security

The SSSC Planner agent (`sssc-planner.agent.md`) addresses software supply chain security—the integrity of dependencies, build processes, and artifact distribution. Its framework references are OpenSSF Scorecard, SLSA (Supply-chain Levels for Software Artifacts), Sigstore, and SBOM (Software Bill of Materials) standards.

**Phase 1: Scoping** maps the project's supply chain surface: direct and transitive dependencies, build systems, artifact registries, deployment pipelines, and third-party integrations. The agent identifies the entry points where supply chain attacks could compromise the system.

**Phase 2: Supply Chain Assessment** evaluates the current supply chain posture against the OpenSSF Scorecard checks. The `sssc-assessment.instructions.md` file defines the evaluation criteria covering dependency management, CI/CD security, code review practices, and vulnerability disclosure processes.

**Phase 3: Standards Mapping** aligns findings against three standards tiers. SLSA defines four levels (L0 through L3) of build integrity assurance, from no guarantees to hermetic, reproducible builds with provenance attestation. OpenSSF Scorecard provides automated checks across multiple security dimensions. Sigstore provides artifact signing and verification through Cosign, Rekor transparency logs, and Fulcio certificate authority. The `sssc-standards.instructions.md` file contains the detailed standards matrix, including third-party attribution for these frameworks.

**Phase 4: Gap Analysis** compares the current posture (from Phase 2) against the applicable standards (from Phase 3) to identify specific gaps. The `sssc-gap-analysis.instructions.md` file defines the gap identification methodology—where the project falls short of its target SLSA level, which Scorecard checks fail, and where Sigstore signing is absent from the build pipeline.

**Phase 5: Backlog Generation** converts identified gaps into actionable work items. Each gap produces backlog items with specific remediation steps, effort estimates, and dependency chains. The backlog structure mirrors the Security Planner's format for consistency across security domains.

**Phase 6: Review and Handoff** consolidates the supply chain assessment for stakeholder review and transitions to implementation.

The SSSC Planner supports four entry modes—more than the other planners. In addition to `capture` and `from-prd`, it supports `from-brd` (business requirements document) and `from-security-plan` (inheriting from the Security Planner). The `from-security-plan` path is the standard chain: Security Planner → RAI Planner → SSSC Planner, each building on the previous planner's output.

The SSSC Planner cross-links to both the Security Planner and RAI Planner through `securityPlannerLink` and `raiPlannerLink` references, enabling bidirectional navigation between the three planning domains.

#### Content: Shared Workflow Architecture

The three planners share an architectural blueprint that is worth examining as a reusable pattern for phased agent design.

**Six-phase workflow.** Every planner uses exactly six phases with the same structural contract: scoping → domain analysis → standards mapping → threat/gap modeling → backlog generation → review and handoff. The phase names differ by domain, but the progression pattern is identical. This consistency means teams that learn one planner's workflow can immediately navigate the others.

**State persistence.** All three planners persist JSON state under `.copilot-tracking/{domain}-plans/{project-slug}/state.json`—`security-plans/`, `rai-plans/`, and `sssc-plans/` respectively. The state protocol follows a six-step cycle: READ (load existing state), VALIDATE (confirm state integrity), DETERMINE (identify current phase and next action), EXECUTE (perform the phase's work), UPDATE (modify state in memory), and WRITE (persist state to disk). This cycle runs on every interaction, ensuring state is always current and recoverable.

**Question-gated progression.** No planner advances to the next phase autonomously. Each phase transition requires explicit user confirmation. The agents ask 3 to 5 questions per turn (7 for the RAI Planner) and present progress using emoji checklists (❓ pending, ✅ complete, ❌ blocked). This interaction model keeps the user in control of the assessment pace and ensures no security decisions are made without human review.

**Startup disclaimer.** Every planner displays a CAUTION block at session start, sourced from `shared/disclaimer-language.instructions.md`. Each planner has its own variant: the Security Planner warns about SAST/DAST/SCA/penetration testing limitations, the RAI Planner warns about responsible AI assessment limitations, and the SSSC Planner warns about supply chain security tooling limitations. The disclaimer is not optional—the instruction files mandate verbatim display, and the agent must re-display it on resume if the previous session's disclaimer is not visible.

**Researcher Subagent delegation.** All three planners delegate evolving standards research to the same Researcher Subagent (`researcher-subagent.agent.md`). This architectural choice isolates framework knowledge that changes frequently—OWASP updates, NIST revisions, new OpenSSF checks—from the planner agents' core workflow logic. The planners define the assessment structure; the Researcher provides current framework content.

**Tool grants.** The three planners share the same tool access pattern: `read` (file access), `edit` (state and artifact writing), `execute/runInTerminal` (script execution), `search` (codebase analysis), `web` (external reference lookup), and `agent` (subagent invocation). This consistent grant pattern simplifies security review of the agent collection.

#### Content: Dual-Format Backlog Handoff

All three planners produce implementation backlogs in two formats: Azure DevOps (ADO) work items and GitHub Issues. The format selection is determined by the target project management system, and both formats can be generated from the same assessment.

The ADO format uses structured work item identifiers with domain-specific prefixes: `WI-SEC-{NNN}` for Security Planner items, `WI-RAI-{NNN}` for RAI Planner items, and `WI-SSSC-{NNN}` for SSSC Planner items. Each work item includes title, description, acceptance criteria, priority, effort estimate, and standards references.

The GitHub Issues format uses temporary reference identifiers: `{{SEC-TEMP-N}}`, `{{RAI-TEMP-N}}`, and `{{SSSC-TEMP-N}}`. These temporary IDs are replaced with actual issue numbers during the creation process. The issue body follows a structured template with the same fields as the ADO format.

Both formats support three autonomy levels for backlog generation. **Full autonomy** generates and creates all backlog items without individual confirmation. **Partial autonomy** (the default for all three planners) generates items for review, then creates them after batch confirmation. **Manual** presents items one at a time for individual approval. The `backlog-handoff.instructions.md`, `sssc-backlog.instructions.md`, and `rai-backlog-handoff.instructions.md` files define the format templates, autonomy levels, and creation workflows for their respective planners.

A critical sanitization step runs before any backlog handoff. The instructions mandate stripping secrets, internal file paths, and personally identifiable information from all generated backlog content. This prevents sensitive data from leaking into project management systems that may have broader access controls than the source repository.

The three planners' backlog items are designed to be composable. A project that runs all three planners produces three sets of work items with distinct prefixes that can be tracked independently or merged into a unified security backlog. The dual-ID system for AI threats (`T-RAI-{NNN}` cross-referenced with `T-{BUCKET}-AI-{NNN}`) ensures that overlapping concerns between the Security Planner and RAI Planner are traceable without duplication.

#### Content: The Security Reviewer

Beyond the three planners, the security collection includes the Security Reviewer agent (`security-reviewer.agent.md`)—an orchestrator rather than a planner. The Security Reviewer operates in three modes: `audit` (full codebase security review), `diff` (review of specific changes), and `plan` (security planning from requirements).

The reviewer coordinates four subagents: the **Codebase Profiler** (maps the application's security surface), the **Skill Assessor** (evaluates which OWASP and security skills apply), the **Finding Deep Verifier** (validates potential findings to reduce false positives), and the **Report Generator** (produces structured security reports). State persists under `.copilot-tracking/security/`, and the orchestrator uses a retry-once protocol for subagent failures.

The Security Reviewer complements the planners. Where the planners work forward from requirements to threat models and backlogs, the reviewer works backward from code to findings. Together, they provide both proactive (planning) and reactive (review) security coverage.

#### Outro

Three takeaways. First, the three planners—Security, RAI, and SSSC—implement the same six-phase workflow pattern against different compliance frameworks, demonstrating that phased agent architecture is a reusable template for structured assessment processes. Second, state persistence under `.copilot-tracking/` with the READ/VALIDATE/DETERMINE/EXECUTE/UPDATE/WRITE cycle provides session continuity and audit trails that are essential for security workflows where decisions must be traceable. Third, the dual-format backlog handoff with domain-specific prefixes and sanitization rules bridges the gap between AI-assisted security analysis and team-based implementation tracking.

This concludes Semester 3: Authoring and Customization. The next semester shifts to operations—collection management, CI/CD integration, and enterprise deployment patterns.

### Key Talking Points

- Three planning agents: Security Planner (STRIDE), RAI Planner (NIST AI RMF 1.0), SSSC Planner (OpenSSF/SLSA/Sigstore)
- Security Planner phases: Scoping → Bucket Analysis → Standards Mapping → Security Model Analysis → Backlog Generation → Review and Handoff
- STRIDE threat IDs: `T-{BUCKET}-{NNN}` standard, `T-{BUCKET}-AI-{NNN}` for AI overlap
- Standards references: OWASP Top 10, NIST 800-53, CIS Benchmarks (Security Planner); NIST AI RMF Govern/Map/Measure/Manage (RAI Planner); OpenSSF Scorecard, SLSA L0–L3, Sigstore/Cosign/Rekor/Fulcio (SSSC Planner)
- RAI Planner risk dimensions: safety_reliability, rights_fairness_privacy, security_explainability
- RAI threat dual-IDs: `T-RAI-{NNN}` cross-referenced with `T-{BUCKET}-AI-{NNN}`
- SSSC Planner supports four entry modes: capture, from-prd, from-brd, from-security-plan
- Shared state persistence: `.copilot-tracking/{domain}-plans/{project-slug}/state.json`
- State cycle: READ → VALIDATE → DETERMINE → EXECUTE → UPDATE → WRITE
- Mandatory startup CAUTION disclaimer from `shared/disclaimer-language.instructions.md`
- All three planners delegate to the same Researcher Subagent for evolving standards
- Backlog prefixes: `WI-SEC-{NNN}` / `WI-RAI-{NNN}` / `WI-SSSC-{NNN}` (ADO), `{{SEC-TEMP-N}}` / `{{RAI-TEMP-N}}` / `{{SSSC-TEMP-N}}` (GitHub)
- Default autonomy level: Partial (generate → review → create)
- Sanitization required before backlog handoff: strip secrets, internal paths, PII
- Security Reviewer complements planners with audit/diff/plan modes and four subagents
