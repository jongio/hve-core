# Module 01: What Is HVE Core?

## Episode 01 | Semester 1: Foundations

### Learning Objectives

- Identify the three gaps that GitHub Copilot has without a prompt engineering layer
- Name the four artifact types in HVE Core and describe what each one does
- Explain how collections group artifacts into distributable products
- Determine which installation path fits a given team size and workflow

### Narration Script

#### Intro

GitHub Copilot generates code. It does not enforce your team's naming conventions, recall decisions made last sprint, or follow a structured research-before-implementation workflow. HVE Core fills those gaps. It is an open-source prompt engineering library from Microsoft that layers specialized agents, auto-applied coding instructions, reusable prompt templates, and executable skills on top of Copilot, turning a general-purpose assistant into a constraint-based engineering workflow.

#### Objectives

Module 1 covers four things. First, the three specific problems that Copilot has when used without a prompt engineering layer. Second, the four artifact types that HVE Core introduces: agents, instructions, prompts, and skills. Third, how the collection system groups those artifacts into distributable packages. Fourth, who uses HVE Core and how to pick the right installation path.

#### Content: The Problem HVE Core Solves

GitHub Copilot ships with broad capabilities but no opinion about your project. It does not know your team's coding standards, it cannot recall architectural decisions from prior sessions, and it has no built-in mechanism for separating research from implementation. These are three distinct problems.

The first problem is no standard enforcement. If your team uses `resource_prefix` as a variable name across twelve Terraform modules, Copilot does not know that. It generates plausible names like `prefix` or `name_prefix` because it optimizes for syntactically valid code, not convention-compliant code. Instructions solve this by encoding your standards in `.instructions.md` files that Copilot applies automatically based on file-pattern matching.

The second problem is no team memory. Copilot starts every session from zero. Decisions about architecture, technology choices, and project constraints exist in documents and people's heads, not in the model's context. HVE Core addresses this through agents like the `memory` agent, which persists notes to workspace files that other agents read on subsequent sessions.

The third problem is no structured workflows. When you ask Copilot to build a feature that spans multiple files and services, it writes code immediately. It does not stop to investigate your existing patterns, verify that the APIs it references actually exist, or create a plan before touching files. HVE Core's RPI workflow — Research, Plan, Implement, Review — solves this by assigning each phase to a specialized agent that is constrained to only perform its designated task.

#### Content: The Four Artifact Types

HVE Core organizes its customizations into four artifact types, each with a distinct file format and role in the system. The repository at `github.com/microsoft/hve-core` contains 49 agents, 102 instructions, 63 prompts, and 11 skills.

**Agents** are `.agent.md` files stored under `.github/agents/`. Each agent defines a specialized AI behavior with access to specific tools. The frontmatter declares which tools the agent can use via a `tools:` array and which other agents it can hand off to via a `handoffs:` array. For example, the Task Researcher agent at `.github/agents/hve-core/task-researcher.agent.md` is described as a "Task research specialist for comprehensive project analysis." It has access to search and read tools but is explicitly constrained from writing code. The body of the file contains the behavioral instructions that shape how the agent responds.

**Instructions** are `.instructions.md` files stored under `.github/instructions/`. They encode coding standards and conventions that Copilot applies automatically based on glob patterns defined in the `applyTo:` frontmatter field. An instruction file with `applyTo: '**/*.py, **/*.ipynb'` activates whenever you are working in Python files. Multiple instructions can stack when their patterns overlap — a Python file inside a test directory could match both a general Python instruction and a testing-specific instruction simultaneously. The repository carries 102 of these, covering languages from Bash and Bicep to Python, C#, Rust, and Terraform.

**Prompts** are `.prompt.md` files stored under `.github/prompts/`. They serve as workflow entry points — reusable templates that capture user intent and route execution to an agent. A prompt's frontmatter uses the `agent:` field to specify which agent handles execution and `description:` to explain the prompt's purpose. The `${input:varName}` template syntax lets prompts accept user inputs. Running `/task-research` in Copilot Chat, for example, invokes the `task-research.prompt.md` file, which automatically switches to the Task Researcher agent.

**Skills** are directory-based packages under `.github/skills/`. Each skill contains a `SKILL.md` entry point plus cross-platform scripts (`.sh` and `.ps1` implementations). Unlike instructions, which provide passive guidance, skills execute actual operations — they are active utilities that agents invoke for specialized tasks. The distinction matters: instructions answer "what standards apply here?" while skills answer "what specialized utility does this task require?"

#### Content: Collection-Driven Architecture

Artifacts do not ship individually. They ship inside collections — curated bundles defined by YAML manifest files in the `collections/` directory at the repository root. Each manifest has an `id`, a `name`, a `description`, and an `items` array that references artifact paths and their kinds.

The repository defines 13 domain collections. The flagship collection is `hve-core` (id: `hve-core`), which contains 17 agents, 15 prompts, 7 instructions, and 1 skill — the core RPI workflow plus Git commit, merge, and pull request prompts. The superset collection is `hve-core-all` (id: `hve-core-all`), which aggregates 51 agents, 63 prompts, 102 instructions, and 12 skills from every domain.

The other domain collections target specific workflows: `ado` for Azure DevOps work item management, `github` for GitHub issue triage and sprint planning, `coding-standards` for language-specific conventions, `data-science` for Jupyter notebooks and Streamlit dashboards, `project-planning` for PRDs, BRDs, ADRs, and architecture diagrams, `security` for vulnerability analysis and incident response, `jira` for Jira backlog management, `gitlab` for merge request workflows, `design-thinking` for nine-method Design Thinking coaching, and `installer` for the interactive setup skill. Each collection carries a maturity level — stable, preview, or experimental — that controls whether it ships in the stable release channel.

Collections drive the VS Code extension build system. The script `scripts/extension/Prepare-Extension.ps1` reads collection manifests, resolves artifact paths, and assembles them into extension packages. Two extensions serve different needs: **HVE Core All** (`ise-hve-essentials.hve-core-all`) installs every artifact from every domain, while **HVE Installer** (`ise-hve-essentials.hve-installer`) lets teams selectively deploy individual collections into their workspace.

#### Content: Who Uses HVE Core

Three groups benefit from HVE Core. Individual developers use it to get structured workflows that prevent the "AI writes first, thinks never" failure mode. The RPI agents give a solo developer the same research-then-implement discipline that a senior engineer applies instinctively — investigate existing patterns, make a plan, execute methodically, review the result.

Development teams use it to enforce consistent standards across contributors. Every team member's Copilot session applies the same coding conventions via shared instruction files. The `coding-standards` collection, for example, carries 15 instructions covering Bash, Bicep, C#, PowerShell, Python, Rust, and Terraform. When a new contributor opens a Python file, Copilot automatically applies the team's Python conventions without anyone configuring anything. The `ado`, `github`, and `jira` collections extend this to work item workflows — agents that follow the team's issue triage process, sprint planning conventions, and pull request standards.

Platform engineers and enterprise organizations use the collection system to curate and distribute approved prompt engineering artifacts at scale. The HVE Installer extension lets a platform team select only the domain collections relevant to their stack — deploying `coding-standards` and `security` across all engineering repos while keeping `data-science` available only to analytics teams. The maturity model adds a governance layer: experimental artifacts never reach the stable channel, so teams can innovate in pre-release without risking production workflows.

The choice between the two VS Code extensions maps directly to these groups. Solo developers and small teams typically start with HVE Core All to get immediate access to all 221 artifacts. Larger teams that need control over which artifacts are active use the HVE Installer to deploy only the collections they have vetted. Contributors who want to modify HVE Core itself clone the repository directly and run `npm ci` to install the development dependencies defined in `package.json`.

#### Outro

HVE Core is a prompt engineering library that adds four artifact types to GitHub Copilot: agents for specialized AI behaviors, instructions for auto-applied coding standards, prompts for reusable workflow entry points, and skills for executable utilities. Collections bundle these artifacts into distributable packages that the extension build system assembles into VS Code extensions. Module 2 covers installation — the three methods, step-by-step marketplace setup, and how to verify that artifacts are active in your workspace.

### Key Talking Points

- Copilot without HVE Core has three gaps: no standard enforcement, no team memory, no structured workflows
- Four artifact types: agents (.agent.md), instructions (.instructions.md), prompts (.prompt.md), skills (SKILL.md directories)
- The repository contains 49 agents, 102 instructions, 63 prompts, and 11 skills organized into 13 collections
- Two VS Code extensions: HVE Core All (221 artifacts, everything) and HVE Installer (selective per-collection deployment)
