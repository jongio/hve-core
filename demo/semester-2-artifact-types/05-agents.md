# Module 05: Agents — Specialized AI Assistants
## Episode 05 | Semester 2: The Four Artifact Types

### Learning Objectives
- Identify the file format and frontmatter fields that define an HVE Core agent
- Classify agents by role across the repository's collection taxonomy
- Explain how subagent architecture enables multi-phase orchestration
- Describe how agents integrate with VS Code Copilot Chat through the agent picker

### Narration Script

#### Intro

Agents are the most visible artifact type in HVE Core. Each agent is a Markdown file with YAML frontmatter that tells GitHub Copilot how to assume a specialized role — what it can do, what tools it has access to, and which other agents it can delegate to. The HVE Core repository ships 57 agent files organized across 12 subdirectories under `.github/agents/`.

#### Objectives

Module 5 covers four areas. First, the `.agent.md` file format and its YAML frontmatter schema. Second, the taxonomy of agents across HVE Core's collections — from RPI orchestrators to security reviewers to platform integrations. Third, subagent architecture and how parent agents reference and delegate to children. Fourth, VS Code Copilot Chat integration through the agent picker.

#### Content: The Agent File Format

Every agent in HVE Core is a single Markdown file with the `.agent.md` extension. The file has two parts: YAML frontmatter delimited by triple dashes, and a Markdown body containing the agent's behavioral instructions.

The frontmatter defines metadata that VS Code and Copilot Chat use to register the agent. The `name` field provides the display name shown in the agent picker. The `description` field is a one-line summary that helps users and Copilot identify when to invoke the agent. For example, the RPI Agent at `.github/agents/hve-core/rpi-agent.agent.md` declares its description as "Autonomous RPI orchestrator running Research → Plan → Implement → Review → Discover phases, using specialized subagents when task difficulty warrants them."

Beyond the required `name` and `description`, agents can declare several optional frontmatter fields. The `tools` field lists specific VS Code tool capabilities the agent needs — the Evaluation Dataset Creator at `.github/agents/data-science/eval-dataset-creator.agent.md` declares `tools: [read, edit/editFiles, edit/createFile]`. The `agents` field lists subagent names this agent can delegate to. The `user-invocable` field controls whether the agent appears in the picker or is hidden as a subagent-only worker. The `disable-model-invocation` field, when true, tells the agent to avoid making model calls directly and instead delegate all work through its subagents.

The Markdown body below the frontmatter contains the agent's full behavioral specification. This is free-form instructional text — role definitions, phase descriptions, required protocols, templates, and examples. The RPI Agent's body runs over 800 lines of structured workflow documentation. The PR Review agent at `.github/agents/hve-core/pr-review.agent.md` includes review dimension checklists, tracking directory templates, and a four-phase review protocol. These are not suggestions to the model — they are the operational contract the agent follows.

One additional frontmatter feature is `handoffs`. The RPI Agent defines multiple handoff buttons — labeled "1️⃣", "2️⃣", "3️⃣", "▶️ All", "🔄 Suggest", and "💾 Save" — that appear as clickable actions in Copilot Chat. Each handoff specifies a target agent and a prompt to send. The "💾 Save" handoff routes to the Memory agent with a `/checkpoint` command. Handoffs create navigable workflows directly inside the chat interface.

#### Content: Agent Taxonomy Across Collections

The 57 agents in HVE Core span a wide range of engineering roles, organized into subdirectories that map to the collection system covered in a later module.

The `hve-core/` subdirectory contains the core workflow agents. The RPI Agent (`rpi-agent.agent.md`) is the primary orchestrator for the Research-Plan-Implement-Review-Discover workflow. The Task Planner (`task-planner.agent.md`) creates actionable implementation plans and delegates research to a Researcher Subagent and validation to a Plan Validator. The Task Implementor (`task-implementor.agent.md`) executes those plans. The PR Review agent (`pr-review.agent.md`) runs a four-phase pull request review process. The Prompt Builder (`prompt-builder.agent.md`) is a prompt engineering assistant that delegates to Prompt Tester, Prompt Evaluator, and Prompt Updater subagents. The Memory agent (`memory.agent.md`) handles conversation context persistence and checkpointing. The Doc Ops agent (`doc-ops.agent.md`) manages documentation updates.

The `coding-standards/` directory holds review agents. Code Review Full (`code-review-full.agent.md`) orchestrates two-phase code reviews by delegating to Code Review Functional and Code Review Standards subagents. These agents load language-specific skills dynamically based on which file types appear in the diff.

The `security/` directory contains the Security Reviewer (`security-reviewer.agent.md`), Security Planner, and SSSC Planner agents. The Security Reviewer declares four subagents — Codebase Profiler, Skill Assessor, Finding Deep Verifier, and Report Generator — and uses `tools` including `agent`, `execute/runInTerminal`, `search/codebase`, `search/fileSearch`, and `read/readFile`. It runs OWASP vulnerability assessments using skill-based knowledge bases.

Platform integration agents live in their own directories. The `ado/` directory has ADO Backlog Manager and ADO PRD to WIT agents for Azure DevOps. The `github/` directory has the GitHub Backlog Manager. The `jira/` directory has equivalent Jira agents. The `project-planning/` directory holds specialized planning agents — PRD Builder, BRD Builder, ADR Creation, Agile Coach, Architecture Diagram Builder, Meeting Analyst, UX/UI Designer, and System Architecture Reviewer. The `data-science/` directory contains agents for evaluation dataset creation, Jupyter notebook generation, Streamlit dashboard generation, and synthetic data specification. The `design-thinking/` directory has the DT Coach and DT Learning Tutor. The `experimental/` directory includes the PowerPoint Builder and Experiment Designer.

#### Content: Subagent Architecture

HVE Core implements a hierarchical delegation model. Parent agents declare their children in the `agents` frontmatter field and invoke them at runtime using tools like `runSubagent` or `task`.

The RPI Agent declares two subagents: `Researcher Subagent` and `Phase Implementor`. When the RPI Agent reaches its Research phase, it delegates to the Researcher Subagent with specific research questions and an output file path under `.copilot-tracking/research/subagents/`. The Researcher Subagent at `.github/agents/hve-core/subagents/researcher-subagent.agent.md` sets `user-invocable: false` — it only runs when a parent agent spawns it. After the Researcher returns findings, the RPI Agent synthesizes results and proceeds to planning. During implementation, it delegates to the Phase Implementor, which executes a single bounded phase from the plan.

The Task Planner follows the same pattern with two different subagents: Researcher Subagent (shared with the RPI Agent) and Plan Validator. The Prompt Builder declares four subagents: Prompt Tester, Prompt Evaluator, Prompt Updater, and Researcher Subagent. The Code Review Full agent delegates to Code Review Functional and Code Review Standards. The Security Reviewer delegates to Codebase Profiler, Skill Assessor, Finding Deep Verifier, and Report Generator.

Subagent files live in `subagents/` subdirectories. The `hve-core/subagents/` directory contains Researcher Subagent, Phase Implementor, Plan Validator, Implementation Validator, Prompt Evaluator, Prompt Tester, Prompt Updater, and RPI Validator. The `security/subagents/` directory contains Codebase Profiler, Finding Deep Verifier, Report Generator, and Skill Assessor. The `experimental/subagents/` directory contains the PowerPoint Subagent.

A key constraint is that subagents do not run their own subagents. Only the orchestrating parent manages delegation calls. The PowerPoint Builder agent makes this explicit: "Subagents do not run their own subagents; only this orchestrator manages subagent calls." This keeps execution trees shallow and predictable — at most two levels deep.

Each subagent call follows a structured contract. The parent provides inputs (research topics, file paths, phase identifiers), the subagent executes and produces artifacts (research documents, execution logs, validation reports), and the parent reads those artifacts before proceeding. All artifacts persist in `.copilot-tracking/` directories so the workflow can resume if a session is interrupted.

#### Content: VS Code Copilot Chat Integration

Agents surface in VS Code through the Copilot Chat agent picker. When a user opens the chat panel, available agents appear in a dropdown selector. The agent's `name` field becomes the display label, and the `description` provides the tooltip or secondary text.

Selecting an agent scopes the entire conversation to that agent's behavioral instructions. The model receives the agent's Markdown body as its system prompt, constraining responses to the agent's defined role, required phases, and output formats. If the agent declares `tools`, only those tools are available during the session. If the agent declares `agents`, it can spawn subagent conversations during execution.

The `argument-hint` frontmatter field provides placeholder text in the chat input when an agent is selected. The RPI Agent's hint reads "Autonomous RPI agent. Uses subagents when task difficulty warrants them." The Evaluation Dataset Creator's hint reads "create an evaluation dataset for [agent name or description]." These hints guide the user toward effective first messages.

The `handoffs` feature extends the chat interface with action buttons. When the RPI Agent defines a handoff labeled "⚡ Implement" pointing to the Task Implementor with prompt `/task-implement`, a button with that label appears in the chat. Clicking it sends the specified prompt to the target agent, enabling one-click workflow transitions without typing commands.

Agents with `user-invocable: false` are excluded from the picker entirely. The Researcher Subagent, Phase Implementor, Plan Validator, and other subagents are invisible to the end user — they exist solely as delegation targets for orchestrator agents.

#### Outro

Agents are the most complex artifact type in HVE Core, but their structure follows consistent patterns: YAML frontmatter declares identity and capabilities, Markdown body defines behavior, and subagent references enable delegation. The 57 agents across the repository cover everything from code review to security assessment to PowerPoint generation, all following the same file format. In Module 6, we shift to instructions — the artifact type that applies automatically based on which files you have open.

### Key Talking Points
- Agent files use `.agent.md` with YAML frontmatter declaring `name`, `description`, `tools`, `agents`, `user-invocable`, and `handoffs`
- The repository ships 57 agents across 12 subdirectories covering RPI workflows, code review, security, platform integrations, planning, data science, and design thinking
- Subagent architecture uses a two-level hierarchy where parent agents delegate via `runSubagent` or `task` tools and subagents produce artifacts in `.copilot-tracking/`
- VS Code integration surfaces agents in the Copilot Chat picker, with `handoffs` providing clickable workflow transitions between agents
