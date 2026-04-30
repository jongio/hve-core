# Module 14: Enterprise Adoption and Contributing

## Episode 14 | Semester 4: Operations and Mastery

### Learning Objectives

- Design a collection-scoped deployment strategy for organizations with diverse team requirements
- Describe the governance model including maintainer roles, decision tiers, and inactivity policies
- Execute the contribution workflow from fork through branch, lint:all, and PR with Conventional Commits
- Assess HVE Core's strengths and limitations for enterprise prompt engineering adoption

### Narration Script

#### Intro

The previous modules covered what HVE Core contains and how it is built, validated, and released. This final module addresses the operational questions that determine whether any of that matters in practice: how organizations deploy HVE Core to teams with different needs, how the project governs itself, how new contributors participate, and where HVE Core's approach to prompt engineering genuinely helps versus where it falls short.

#### Objectives

Module 14 covers four areas. First, collection-scoped deployment — using collection manifests to ship different artifact subsets to different teams within an organization. Second, the governance model defined in `GOVERNANCE.md` — roles, decision tiers, role progression, and inactivity policies. Third, the contribution workflow documented in `CONTRIBUTING.md` — from environment setup through PR submission with Conventional Commits. Fourth, an honest assessment of HVE Core's strengths and limitations as an enterprise prompt engineering platform.

#### Content: Collection-Scoped Deployment

Enterprise adoption rarely means installing everything for everyone. A security team needs the security collection. A platform engineering team needs infrastructure-focused agents. A data science team needs analytical prompts. HVE Core's collection system addresses this through the `collections/` directory, which currently contains thirteen collection definitions: `hve-core` (primary), `hve-core-all` (comprehensive), `coding-standards`, `security`, `github`, `gitlab`, `ado` (Azure DevOps), `jira`, `project-planning`, `design-thinking`, `data-science`, `experimental`, and `installer`.

Each collection is defined by a YAML manifest (`.collection.yml`) and a companion Markdown description (`.collection.md`). The YAML manifest specifies which agents, instructions, prompts, and skills are included. When the packaging pipeline runs with `-Collection` pointing to a manifest, `Prepare-Extension.ps1` filters the artifact set to only those listed in that collection. The resulting VSIX contains exactly those artifacts — no more, no less.

For enterprise deployment, this means an organization can maintain a single HVE Core source-of-truth while distributing different extension variants. The VS Code Marketplace supports multiple extension IDs, so each collection can publish as a separate extension. Teams install the collection extension that matches their workflow. The `coding-standards` collection provides style enforcement agents and instructions without the overhead of project management prompts. The `security` collection provides vulnerability analysis agents without data science tooling. Platform-specific collections like `github`, `gitlab`, `ado`, and `jira` provide agents tuned to each platform's API and workflow conventions.

The maturity filtering system adds a second deployment dimension. The `Stable` channel restricts artifacts to those with `stable` maturity — these have been through the full review cycle and are considered production-ready. The `PreRelease` channel includes `preview` and `experimental` maturity levels in addition to stable. An enterprise can use the stable channel for general distribution and the pre-release channel for teams that want to evaluate emerging capabilities. The even/odd minor version convention makes this visible in version numbers: `3.4.x` is stable, `3.3.x` is pre-release.

For organizations building on HVE Core rather than consuming it directly, the collection manifest format provides a starting point for creating custom collections. A team can define a collection that includes specific agents from multiple existing collections, add organization-specific instructions, and package the result as an internal extension. The Prepare and Package pipeline handles the mechanics — the organizational decision is which artifacts belong in which collection.

#### Content: Governance Model

HVE Core operates under a corporate-sponsored maintainer model, documented in `GOVERNANCE.md`. Microsoft provides stewardship, infrastructure, and core maintainer resources. Community contributors participate through standard open source workflows. The project uses consensus-seeking for routine decisions rather than voting.

Three roles define participation. **Maintainers** guide project direction, manage releases, enforce the code of conduct, and control repository access. They can review code, merge pull requests, make architecture decisions, manage releases, triage issues, and manage labels. Current maintainers are members of the `@microsoft/edge-ai-core-dev` team. **Triage contributors** assist maintainers by labeling issues, performing initial assessments, identifying duplicates, requesting clarification, and answering community questions. They can review code, triage issues, and manage labels, but cannot merge pull requests or manage releases. **Contributors** submit pull requests, improve documentation, report issues, and participate in discussions.

Decisions follow a four-tier model based on impact. **Routine changes** — bug fixes, documentation updates, minor enhancements — require one maintainer approval and merge after CI passes. **Significant changes** — new features, API additions, multi-component changes — require two maintainer approvals and a 48-hour review window; they may require a design discussion issue before implementation. **Breaking changes** — behavior alterations or feature removal — require two maintainer approvals with explicit breaking-change acknowledgment, a documented migration path, and semantic versioning for major increments. **Governance changes** — modifications to the governance document itself — require consensus among active maintainers and a one-week community comment period.

Role progression is merit-based. Contributors may be nominated for triage status after sustained positive contributions over three or more months, demonstrated understanding of project scope, and consistent helpful engagement. Triage contributors may be nominated for maintainer status after consistent high-quality contributions over six or more months, technical judgment aligned with project direction, and demonstrated ability to mentor others. Nominations follow the same process: an existing maintainer nominates, maintainers reach consensus, and the candidate is invited and onboarded.

The inactivity policy is documented explicitly. Contributors inactive for six months may have elevated permissions reviewed. Role removal is not punitive — contributors may return when availability permits. For issues, inactivity follows a three-stage lifecycle: active (activity within 60 days), stale (60 days without activity, warning posted), and closed-stale (14 days after stale label without activity, issue closed as `not_planned`). Issues labeled `pinned`, `security`, or `do-not-close`, or assigned to a milestone, are exempt. For pull requests, the inactivity clock runs only when the PR is waiting on the author — reviewer-side delays do not count. Stale PRs get 14 days of inactivity before a reminder, then 7 more days before closure. Draft PRs are fully exempt. PRs labeled `do-not-close` or `waiting-on-reviewer` are exempt.

Access continuity is maintained through Microsoft stewardship. Multiple Microsoft employees hold administrative access. Critical credentials — VS Code Marketplace publishing, GitHub admin, CI/CD secrets — are managed through Microsoft infrastructure. No single point of failure exists for project operations.

All external contributors must sign the Microsoft Contributor License Agreement through the CLA bot on their first pull request. Signed agreements authorize contribution under the MIT License.

#### Content: Contribution Workflow

CONTRIBUTING.md defines the step-by-step workflow for code contributions. The recommended development environment is the provided DevContainer, which comes pre-configured with all required tools: `markdownlint-cli2`, `cspell`, `markdown-table-formatter`, `markdown-link-check`, PowerShell 7, `PSScriptAnalyzer`, `PowerShell-Yaml`, and Pester.

The workflow begins with an issue. Contributors assign an existing issue to themselves or file a new one to engage with maintainers for guidance. Commits should reference related issues for traceability using closing keywords like "Fixes #123" or "Relates to #456".

Before pushing, contributors run `npm run lint:all` — the fifteen-pass validation pipeline covered in Module 12. The individual validation commands are also available: `npm run lint:md` for Markdown, `npm run lint:ps` for PowerShell, `npm run lint:yaml` for YAML, `npm run lint:frontmatter` for schema validation, `npm run lint:links` for link checks, `npm run lint:collections-metadata` for collection manifests, `npm run spell-check` for spelling, `npm run format:tables` for table formatting, and `npm run test:ps` for Pester tests.

Commit messages must follow Conventional Commits format, which drives release-please's automated version management. The format is `type(scope): description`, where type determines the version bump. `feat:` triggers a minor version bump. `fix:` triggers a patch bump. `docs:`, `chore:`, and `refactor:` appear in the changelog but do not bump the version. `feat!:` or a `BREAKING CHANGE:` footer triggers a major bump. Examples from the project documentation:

- `feat(instructions): add Terraform best practices` — minor bump
- `fix(workflows): correct frontmatter validation path` — patch bump
- `docs(readme): update installation steps` — no version bump
- `feat!: redesign prompt file structure` with `BREAKING CHANGE: prompt files now require category frontmatter field` — major bump

Pull requests target the `main` branch. Pre-determined reviewer groups are automatically added to each PR. CI runs the `pr-validation.yml` workflow, executing all validation, security, and testing checks. New PowerShell scripts require corresponding `*.Tests.ps1` files in `scripts/tests/`, mirroring the source directory structure. Skill scripts are an exception — their tests live co-located in `.github/skills/<skill-name>/tests/`. Bug fixes should include regression tests when feasible. Documentation-only changes do not require tests.

For AI artifact contributions specifically — agents, prompts, instructions, and skills — CONTRIBUTING.md points to specialized guides in `docs/contributing/`. The contributing hub at `docs/contributing/README.md` provides an overview. Individual guides cover custom agents, instructions, prompts, and skills. Common standards at `docs/contributing/ai-artifacts-common.md` define shared quality gates and rejection criteria. The release process guide at `docs/contributing/release-process.md` covers extension channels, maturity levels, and publishing workflows.

Release validation requires all contributions pass spell checking, Markdown linting, table format checking, and dependency pinning checks. These gates apply regardless of whether the contribution is a code change, documentation update, or new AI artifact.

#### Content: Strengths and Limitations

HVE Core's primary strength is treating prompt engineering as a software engineering discipline. The structured frontmatter system, the validation infrastructure, the collection model, the maturity lifecycle, and the CI/CD pipeline collectively impose the same rigor on AI artifacts that traditional codebases apply to source code. For organizations where multiple teams need standardized, version-controlled, reviewable prompt engineering artifacts, this is a genuine capability that ad-hoc approaches do not provide.

The collection system solves the deployment fragmentation problem. Teams get relevant artifacts without noise. The packaging pipeline handles the mechanics. The maturity system provides a structured path from experimental to production. These are real operational concerns for any organization running prompt engineering at scale.

The governance model and contribution workflow lower participation barriers. The DevContainer eliminates environment setup friction. The `lint:all` pipeline catches common issues before code review. The Conventional Commits requirement feeds automated versioning, removing manual release coordination. The four-tier decision model sets clear expectations about review requirements for different change types.

The supply chain security posture is unusually thorough for a prompt engineering project. Cryptographic attestation via Sigstore, SBOM generation in SPDX format, dependency pinning enforcement, action SHA consistency checking, secret scanning, and the ability to verify release artifacts with `gh attestation verify` — these practices align with OpenSSF best practices and are not commonly found in prompt engineering tooling.

Limitations exist and are worth stating directly. HVE Core operates at the prompt definition layer, not the runtime layer. There is no runtime enforcement — a well-structured agent file produces good AI behavior when the model follows the instructions, but there is no guarantee mechanism. The validation infrastructure verifies structural correctness of artifacts, not behavioral correctness of AI responses. An agent with valid frontmatter and well-written instructions can still produce poor outputs depending on the model, the context, and the user's query.

Telemetry and observability are not part of HVE Core's scope. The library produces static artifacts — it does not instrument AI interactions, measure prompt effectiveness, or track which instructions produce better outcomes. Organizations that need prompt performance analytics will need to implement that measurement layer separately.

The dependency on VS Code as the delivery mechanism means HVE Core's collection system is tied to the VS Code extension ecosystem. Teams using other editors or IDE-less workflows cannot directly consume the packaged artifacts, though the underlying Markdown files are editor-agnostic.

Finally, the library's scale — over 500 artifacts, 49 CI/CD workflows, thirteen JSON Schemas, twenty-plus validation scripts — represents both a strength and a maintenance commitment. This infrastructure serves a large, actively maintained project. Organizations evaluating HVE Core should understand that adopting the full validation and packaging infrastructure is an investment, not a trivial integration.

#### Outro

This is the final module of the HVE Core course. Three takeaways to close.

First, HVE Core's collection system enables targeted deployment — thirteen collection definitions allow organizations to ship different artifact subsets to different teams, with maturity filtering adding a second dimension of release control. The packaging pipeline handles the mechanics; the organizational decision is which artifacts belong in which collection.

Second, the governance model is explicit and tiered. Three roles — Maintainer, Triage, Contributor — with documented capabilities. Four decision tiers — routine, significant, breaking, governance — with escalating review requirements. Merit-based role progression with defined timelines. Inactivity policies that are fair and reversible. This structure sustains a project that accepts contributions from both Microsoft employees and external community members.

Third, HVE Core succeeds as a structured framework for prompt engineering artifacts with production-grade validation, packaging, and supply chain security. It does not solve runtime enforcement, behavioral testing, or prompt effectiveness measurement. Those remain open problems in the AI engineering space. What HVE Core provides is the engineering infrastructure — version control, schema validation, automated packaging, cryptographic attestation, and governed contribution workflows — that makes prompt engineering manageable at organizational scale.

Over the course of fourteen modules, this course has moved from foundational concepts through artifact authoring, advanced techniques, and into the operational infrastructure that sustains the project. The repository is open source under the MIT License at `github.com/microsoft/hve-core`. The contribution workflow starts with an issue.

### Key Talking Points

- 13 collection definitions in `collections/` enable targeted deployment: hve-core, hve-core-all, coding-standards, security, github, gitlab, ado, jira, project-planning, design-thinking, data-science, experimental, installer
- Collection manifests (`.collection.yml`) specify which agents, instructions, prompts, and skills ship in each variant
- Maturity filtering (Stable vs PreRelease) adds a second deployment dimension; even/odd minor versions distinguish channels
- Governance operates under a corporate-sponsored maintainer model with Microsoft stewardship
- Three roles: Maintainer (merge, release, architecture), Triage (label, assess, support), Contributor (code, docs, issues)
- Four decision tiers: Routine (1 approval), Significant (2 approvals + 48-hour window), Breaking (2 approvals + migration path), Governance (maintainer consensus + 1-week comment period)
- Role progression: Contributor → Triage (3+ months), Triage → Maintainer (6+ months), both via maintainer nomination and consensus
- Inactivity policy: 6-month permission review for contributors; 60-day stale + 14-day closure for issues; 14-day stale + 7-day closure for PRs (author-side only)
- Contribution workflow: issue → fork → branch → `npm run lint:all` → Conventional Commits → PR targeting `main`
- Conventional Commit types drive versioning: `feat:` = minor, `fix:` = patch, `feat!:` = major, `docs:`/`chore:`/`refactor:` = changelog only
- CLA signing required via CLA bot on first PR; MIT License
- Strength: production-grade engineering infrastructure for prompt artifacts — validation, packaging, attestation, governance
- Limitation: no runtime enforcement, no behavioral testing, no prompt effectiveness telemetry — structural correctness only
- Limitation: VS Code extension delivery mechanism ties consumption to the VS Code ecosystem
- DevContainer provides zero-friction development environment with all required tools pre-configured
