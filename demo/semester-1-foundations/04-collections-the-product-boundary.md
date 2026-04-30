# Module 04: Collections — The Product Boundary

## Episode 04 | Semester 1: Foundations

### Learning Objectives

- Define what a collection is and identify the two files that compose one
- List the 13 domain collections in the repository and describe their target workflows
- Explain the maturity model and how it gates release channel eligibility
- Trace the packaging pipeline from collection manifest to VS Code extension

### Narration Script

#### Intro

Agents, instructions, prompts, and skills do not ship individually. They ship inside collections — curated bundles defined by YAML manifests that the build system reads to assemble VS Code extensions. Collections are the product boundary in HVE Core. They determine what ships to whom, at what maturity level, and through which marketplace extension.

#### Objectives

Module 4 covers four things. First, the structure of a collection — its manifest YAML and companion description markdown. Second, the full inventory of collections in the repository, with artifact counts and target domains. Third, the maturity model that controls which collections ship in stable versus pre-release channels. Fourth, the build pipeline that transforms collection manifests into packaged VS Code extensions.

#### Content: Anatomy of a Collection

Every collection in HVE Core consists of two files in the `collections/` directory at the repository root. The manifest file uses the naming convention `<id>.collection.yml` and the description file uses `<id>.collection.md`.

The manifest YAML is the source of truth for artifact selection. It contains four top-level fields. The `id` field is the collection's unique identifier used by the build system and installer. The `name` field is the human-readable display name. The `description` field summarizes the collection's purpose. The `items` array lists every artifact included in the collection, with each entry specifying a `path` (repository-relative path to the artifact source), a `kind` (one of `agent`, `prompt`, `instruction`, `skill`, or `hook`), and an optional `maturity` field that defaults to `stable` when omitted.

Here is the manifest for the flagship collection at `collections/hve-core.collection.yml`:

```yaml
id: hve-core
name: HVE Core Workflow
description: HVE Core RPI (Research, Plan, Implement, Review) workflow
  with Git commit, merge, setup, and pull request prompts
```

Its `items` array references 17 agents (including 9 primary agents like `rpi-agent`, `task-researcher`, `task-planner`, `task-implementor`, `task-reviewer`, `memory`, `doc-ops`, `prompt-builder`, and `pr-review`, plus 8 subagents), 15 prompts (RPI shortcuts, Git workflow prompts, and prompt engineering prompts), 7 instructions (writing style, markdown, commit messages, prompt builder, git merge, pull request, and a shared HVE Core location instruction), and 1 skill (the shared `pr-reference` skill).

The companion markdown file at `collections/hve-core.collection.md` provides extended documentation. The build system uses the manifest for artifact selection and the markdown for marketplace listing descriptions and documentation site content.

#### Content: The 13 Domain Collections

The `collections/` directory contains manifests for 13 domain collections plus the `hve-core-all` superset. Here is the full inventory from the collections documentation at `docs/getting-started/collections.md`:

| Collection | ID | Agents | Prompts | Instructions | Skills | Maturity |
|---|---|---|---|---|---|---|
| HVE Core Workflow | `hve-core` | 17 | 15 | 7 | 1 | Stable |
| Azure DevOps | `ado` | 2 | 9 | 9 | 1 | Stable |
| Coding Standards | `coding-standards` | 3 | 2 | 15 | 1 | Stable |
| Data Science | `data-science` | 6 | 3 | 10 | 0 | Stable |
| GitHub Backlog | `github` | 1 | 6 | 6 | 0 | Stable |
| GitLab | `gitlab` | 0 | 0 | 1 | 1 | Stable |
| Jira | `jira` | 2 | 4 | 6 | 1 | Stable |
| Project Planning | `project-planning` | 18 | 11 | 20 | 0 | Stable |
| Installer | `installer` | 0 | 0 | 1 | 1 | Stable |
| Design Thinking | `design-thinking` | 2 | 13 | 43 | 0 | Preview |
| Security | `security` | 9 | 14 | 19 | 5 | Experimental |
| RAI Planning | `rai-planning` | 2 | 3 | 8 | 0 | Experimental |
| Experimental | `experimental` | 3 | 0 | 3 | 2 | Experimental |

The `hve-core-all` superset aggregates artifacts from every domain collection: 51 agents, 63 prompts, 102 instructions, and 12 skills — 221 artifacts total across its `items` array. Each individual collection is independently installable. Collections are additive, so installing multiple collections may include overlapping items, and that is expected.

The domain collections group naturally by workflow concern. The `hve-core` collection covers the RPI pipeline and Git workflows. The `ado`, `github`, `jira`, and `gitlab` collections handle work item management and CI/CD integration across four platforms. The `coding-standards` collection provides language-specific instructions for Bash, Bicep, C#, PowerShell, Python, Rust, and Terraform. The `project-planning` collection covers architecture decision records, requirements documents, and diagrams. The `data-science` collection generates Jupyter notebooks, Streamlit dashboards, and data specifications. The `security` collection provides security review, incident response, risk assessment, and vulnerability analysis agents. The `design-thinking` collection offers AI-enhanced coaching across nine Design Thinking methods.

#### Content: The Maturity Model

Collections carry a maturity level that is independent of individual artifact maturity. The maturity field in the collection manifest controls whether the entire collection ships in a given release channel. The architecture documentation at `docs/architecture/ai-artifacts.md` defines four levels:

| Collection Maturity | PreRelease Channel | Stable Channel |
|---|---|---|
| `stable` | Included | Included |
| `preview` | Included | Included |
| `experimental` | Included | Excluded |
| `deprecated` | Excluded | Excluded |

Stable collections like `hve-core`, `ado`, `coding-standards`, and `project-planning` ship in both channels. Preview collections like `design-thinking` also ship in both channels but carry a label indicating they are still maturing. Experimental collections like `security`, `rai-planning`, and `experimental` ship only in the pre-release channel — they are excluded from stable builds entirely.

The maturity field is optional in the manifest and defaults to `stable` when omitted. New collections should start as `experimental` until validated, then graduate through `preview` to `stable` by changing a single field value. Individual items within a collection can also carry their own `maturity` override. For example, the `hve-core-all` manifest marks specific agents as `maturity: experimental` even though the collection itself is stable. Items retain their maturity annotations regardless of how they are installed.

This three-tier model lets the library evolve without breaking production users. Teams running stable extensions never see experimental artifacts. Teams that opt into the pre-release channel get early access to everything. The graduation path — experimental to preview to stable — gives authors a structured way to validate new artifacts with real users before promoting them.

#### Content: The Packaging Pipeline

Collection manifests drive the VS Code extension build system. The pipeline starts with the `Prepare-Extension.ps1` script at `scripts/extension/Prepare-Extension.ps1`, which accepts a `-Collection` parameter specifying which collection manifest to read. The script resolves artifact paths from the manifest's `items` array, checks maturity levels against the target release channel, and assembles the selected files into the extension's output directory. A separate `Package-Extension.ps1` script at `scripts/extension/Package-Extension.ps1` then packages the output into a `.vsix` file using the `@vscode/vsce` tool declared in `package.json`.

The `npm run extension:prepare` and `npm run extension:package` scripts in `package.json` wrap these PowerShell scripts for convenience. A pre-release variant uses `npm run extension:prepare:prerelease` and `npm run extension:package:prerelease` to include experimental-maturity items.

Validation runs before packaging. The `npm run lint:collections-metadata` script (backed by `scripts/collections/Validate-Collections.ps1`) checks that every path referenced in a collection manifest actually exists in the repository and that manifest fields conform to the expected schema. The `npm run lint:marketplace` script (backed by `scripts/plugins/Validate-Marketplace.ps1`) validates marketplace-specific metadata. These checks run in CI through GitHub Actions workflows, so broken manifests or dangling artifact references fail the build before reaching the marketplace.

The result is a deterministic pipeline: collection manifest → artifact resolution → maturity filtering → extension assembly → packaging → marketplace publish. Adding a new artifact to a collection means adding one entry to the manifest's `items` array. Promoting an artifact from experimental to stable means changing one `maturity` field. The manifest is the single source of truth.

#### Outro

Collections are the product boundary in HVE Core. Each collection is a YAML manifest plus a markdown description that together define which artifacts ship, to whom, and at what maturity level. The repository contains 13 domain collections ranging from the flagship RPI workflow to specialized bundles for Azure DevOps, security, and Design Thinking. The maturity model gates release eligibility across stable, preview, and experimental tiers. The build pipeline reads manifests, resolves artifacts, filters by maturity, and produces VS Code extensions. That completes Semester 1. You now understand the four artifact types, how to install and verify HVE Core, the RPI methodology, and the collection system that packages it all for distribution.

### Key Talking Points

- A collection is two files: `<id>.collection.yml` (manifest with items array) and `<id>.collection.md` (description)
- 13 domain collections plus the `hve-core-all` superset totaling 221 artifacts
- Three maturity levels — stable, preview, experimental — control release channel eligibility
- The build pipeline is deterministic: manifest → artifact resolution → maturity filter → extension package
