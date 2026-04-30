# Module 07: Prompts — Reusable Task Templates
## Episode 07 | Semester 2: The Four Artifact Types

### Learning Objectives
- Describe the `.prompt.md` file format including `description`, `mode`, and `agent` delegation fields
- Explain how prompts surface as slash commands in VS Code Copilot Chat
- Categorize prompt families across HVE Core's domain areas
- Identify how input variables and argument hints enable parameterized task execution

### Narration Script

#### Intro

Prompts are task templates — reusable, parameterized Markdown files that surface as slash commands in VS Code Copilot Chat. Where agents define persistent roles and instructions activate automatically, prompts represent discrete actions a developer invokes on demand. The HVE Core repository contains 68 prompt files under `.github/prompts/`, organized into subdirectories that mirror the agent and instruction structure.

#### Objectives

Module 7 covers four areas. First, the `.prompt.md` file format and its frontmatter fields. Second, slash command invocation in Copilot Chat. Third, prompt families and how they group by domain across HVE Core. Fourth, input variables and argument hints that make prompts parameterized and flexible.

#### Content: The Prompt File Format

Every prompt file uses the `.prompt.md` extension and begins with YAML frontmatter. The required field is `description` — a one-line summary that Copilot uses to identify the prompt and display it in the command palette. The prompt at `.github/prompts/hve-core/rpi.prompt.md` declares `description: "Autonomous Research-Plan-Implement-Review-Discover workflow for completing tasks - Brought to you by microsoft/hve-core"`.

The `agent` field is optional but common. It specifies which agent should handle execution when the prompt is invoked. The RPI prompt sets `agent: RPI Agent`, routing execution to the full RPI Agent with its subagent architecture. The git commit prompt at `.github/prompts/hve-core/git-commit.prompt.md` sets `agent: 'agent'`, using the default agent context. The security review prompt at `.github/prompts/security/security-review.prompt.md` sets `agent: Security Reviewer`, delegating to the Security Reviewer with its four subagents. The code review full prompt at `.github/prompts/coding-standards/code-review-full.prompt.md` sets `agent: Code Review Full`. When a prompt declares an agent, invoking the prompt activates that agent for the duration of the task.

The `name` field provides an explicit identifier for the slash command. The security review prompt sets `name: security-review`. The code review prompt sets `name: code-review-full`. When `name` is present, it becomes the command that appears in the chat — `/security-review` or `/code-review-full`. When `name` is absent, VS Code derives the command from the filename.

The `argument-hint` field provides placeholder text that appears after the slash command in the input field. The RPI prompt's hint reads `"task=... [continue={1|2|3|all}] [suggest]"`, telling the user what parameters are available. The security review prompt's hint lists `"[scope=path/to/dir] [mode={audit|diff|plan}] [targetSkill={owasp-top-10|owasp-llm|owasp-agentic|owasp-mcp|owasp-infrastructure|owasp-cicd|owasp-docker|secure-by-design}]"`. These hints serve as inline documentation at the point of invocation.

The Markdown body below the frontmatter defines the prompt's behavior — inputs, requirements, steps, success criteria, and error handling. This is the task template itself. Unlike agent bodies which define an ongoing role, prompt bodies define a single execution path.

#### Content: Slash Command Invocation

Prompts surface in VS Code Copilot Chat as slash commands. When a user types `/` in the chat input, a dropdown shows all available prompts. Selecting one (or typing its name) sends the prompt's Markdown body to the model, optionally within the context of the designated agent.

The invocation model is direct. Typing `/rpi task=implement the login endpoint` sends the RPI prompt body to the RPI Agent with the task parameter populated. Typing `/git-commit` sends the git commit prompt body to the default agent. Typing `/security-review mode=audit` sends the security review prompt to the Security Reviewer agent with audit mode selected.

The `description` field matters for discoverability. When a user types `/` and browses the dropdown, they see the prompt name and description side by side. Clear descriptions help users find the right command without memorizing names. The checkpoint prompt's description reads "Save or restore conversation context using memory files." The pull request prompt reads "Generates pull request descriptions from branch diffs." Each description is a concise summary of what the command does.

Prompts that declare an `agent` gain all the capabilities of that agent during execution. The `/security-review` prompt activates the Security Reviewer agent, which can then delegate to its four subagents — Codebase Profiler, Skill Assessor, Finding Deep Verifier, and Report Generator — running a full vulnerability assessment from a single slash command. The `/code-review-full` prompt activates the Code Review Full agent, which delegates to functional and standards review subagents. A simple slash command can trigger a complex multi-agent workflow.

#### Content: Prompt Families

The 68 prompts organize into domain families that mirror the agent and instruction directories.

The `hve-core/` family contains the core workflow prompts. The `/rpi` prompt launches the full Research-Plan-Implement-Review-Discover cycle. The `/task-plan` prompt initiates implementation planning with the Task Planner agent. The `/task-research` prompt starts a focused research session with the Task Researcher. The `/task-implement` prompt triggers implementation execution. The `/task-review` prompt starts a review cycle. The `/git-commit` prompt stages changes and generates conventional commit messages. The `/git-commit-message` prompt generates a commit message without staging. The `/git-merge` prompt handles merge workflows. The `/git-setup` prompt initializes repository configuration. The `/pull-request` prompt generates PR descriptions. The `/checkpoint` prompt saves or restores conversation context via the Memory agent. The `/doc-ops-update` prompt updates documentation. The `/prompt-build`, `/prompt-analyze`, and `/prompt-refactor` prompts support prompt engineering workflows.

The `security/` family provides security assessment prompts. The `/security-review` prompt runs OWASP vulnerability scans with mode options for audit, diff, and plan analysis. Specialized prompts target specific frameworks: `/security-review-llm` for LLM applications, `/security-review-web` for web applications, `/security-review-sbd` for secure-by-design assessment. The `/security-plan-from-prd` prompt generates security plans from product requirements documents. The `/risk-register` prompt creates risk registers. The `/incident-response` prompt generates incident response procedures. The `/security-capture` and `/sssc-capture` prompts capture security findings. Additional SSSC prompts generate supply chain security plans from BRDs, PRDs, and security plans.

The `ado/` family covers Azure DevOps integration — 10 prompts for adding work items, creating pull requests, discovering work items, getting build info, retrieving personal work items, processing work items for task planning, sprint planning, triaging work items, and updating work items.

The `github/` family provides six prompts: adding issues, discovering issues, executing backlog, sprint planning, suggesting work, and triaging issues. The `jira/` family has a parallel set of five prompts.

The `design-thinking/` family has 15 prompts spanning the full design thinking process — from starting a project through convergence, ideation, concepts, evaluation, building, planning, testing, and handoff across problem, solution, and implementation spaces.

The `rai-planning/` family has three prompts for Responsible AI: capturing RAI findings and generating RAI plans from PRDs and security plans.

The `data-science/` family has the synthetic data generation prompt. The `coding-standards/` family has the code review full and code review functional prompts.

#### Content: Input Variables and Parameterization

Prompts use a variable syntax — `${input:variableName}` — to accept parameters from the user at invocation time. Default values use a colon syntax: `${input:mode:audit}` means the `mode` variable defaults to `audit` if the user omits it.

The RPI prompt defines three inputs: `${input:task}` as the required task description, `${input:continue}` as an optional parameter to continue with previously suggested work items, and `${input:suggest}` as an optional trigger for Phase 5 discovery. The Requirements section specifies how each input maps to agent behavior — when `continue` is provided, the agent skips directly to Phase 1 with referenced work items.

The security review prompt defines four inputs: `${input:mode:audit}` defaulting to audit, `${input:targetSkill}` for selecting a specific OWASP skill, `${input:scope}` for limiting analysis to specific directories, and `${input:plan}` for providing an implementation plan document path. Each input has a comment explaining its purpose and valid values.

The checkpoint prompt demonstrates delegation with inputs: `${input:mode:save}` with three valid modes (save, continue, incremental), `${input:description}` for the memory file name, and `${input:chat:true}` for including conversation context. The prompt body maps these inputs to specific steps — determine mode, then execute the operation through the Memory agent.

The pull request prompt uses inputs for workflow configuration: `${input:branch:origin/main}` defaults to comparing against origin/main, `${input:createPullRequest:false}` controls whether to actually create the PR or just generate the description, and `${input:excludeMarkdown:false}` controls whether to exclude markdown diffs from the reference generation.

The GitHub add-issue prompt at `.github/prompts/github/github-add-issue.prompt.md` demonstrates a complex parameterized workflow. It accepts `${input:templateName}`, `${input:title}`, `${input:body}`, `${input:labels}`, and `${input:assignees}` — all optional. When parameters are omitted, the prompt's five-step workflow discovers templates from the repository, prompts the user interactively for required fields, creates the issue via GitHub MCP tools, and logs the result as a tracking artifact. Parameters serve as shortcuts that skip interactive steps.

#### Outro

Prompts are the action layer of HVE Core. They convert complex multi-step workflows into single slash commands. The 68 prompts across the repository cover everything from git operations to security assessments to design thinking exercises. Input variables make them parameterized, agent delegation gives them access to full orchestration capabilities, and argument hints document usage at the point of invocation. In Module 8, we examine skills — the self-contained packages that bundle scripts, references, and tests into reusable knowledge units.

### Key Talking Points
- Prompts use `.prompt.md` with frontmatter fields `description`, `agent`, `name`, and `argument-hint` — the `agent` field routes execution to a specific agent and its full subagent tree
- Prompts surface as slash commands in Copilot Chat (`/rpi`, `/git-commit`, `/security-review`, `/code-review-full`) with descriptions shown in the dropdown for discoverability
- The 68 prompts span HVE Core workflows, security (OWASP reviews, risk registers), platform integrations (ADO, GitHub, Jira), design thinking (15 prompts), and git operations
- Input variables (`${input:variableName:default}`) parameterize prompts — the security-review prompt accepts mode, targetSkill, scope, and plan parameters all with documented defaults
