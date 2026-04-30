# Module 03: The RPI Methodology

## Episode 03 | Semester 1: Foundations

### Learning Objectives

- Describe the four phases of the RPI workflow and the type transformation each phase performs
- Identify the specialized agent responsible for each phase and locate its source file
- Explain the data flow between phases using `.copilot-tracking/` artifact handoffs
- Decide when to use full four-phase RPI versus individual agents or the `rpi-agent` orchestrator

### Narration Script

#### Intro

AI coding assistants optimize for plausible output. When you ask for a feature that spans multiple files, the assistant writes code immediately — without verifying that variable names match your conventions, that the APIs it references exist, or that its approach aligns with existing patterns. The RPI workflow fixes this by separating AI work into four constrained phases: Research, Plan, Implement, Review. Each phase has a dedicated agent that is structurally prevented from doing the other phases' work.

#### Objectives

Module 3 covers four things. First, the four phases and the specific type transformation each one performs. Second, the agent files and frontmatter that define each phase's behavior. Third, the artifact handoff contracts — the files each agent produces and the next agent consumes. Fourth, the decision framework for choosing between full RPI, individual agents, and the `rpi-agent` orchestrator.

#### Content: The Four Phases

The RPI documentation at `docs/rpi/README.md` defines the workflow as a type transformation pipeline:

> Uncertainty → Knowledge → Strategy → Working Code → Validated Code

Each arrow is a phase. Each phase is handled by a different custom agent with different tools, different constraints, and a fresh context window.

**Research** transforms uncertainty into knowledge. The Task Researcher agent investigates your codebase, external APIs, and documentation to produce an evidence-backed research document. It searches for existing patterns instead of inventing new ones, cites specific files and line numbers as evidence, and questions its own assumptions. The output is a markdown file at `.copilot-tracking/research/{{YYYY-MM-DD}}-<topic>-research.md` containing scope definition, evidence logs with sources, code examples from the codebase, external research findings, and one recommended approach per technical scenario.

The constraint is what makes this work. Task Researcher knows it will never write the implementation code. As the documentation at `docs/rpi/why-rpi.md` explains: "When AI knows it cannot implement during research, it stops optimizing for plausible code and starts optimizing for verified truth." Without that constraint, the model tries to be helpful by jumping to implementation. With it, the model invests its entire token budget in investigation.

**Plan** transforms knowledge into strategy. The Task Planner agent reads the research document and produces two coordinated files: a plan file at `.copilot-tracking/plans/{{YYYY-MM-DD}}-<topic>-plan.instructions.md` with phased checklists and a details file at `.copilot-tracking/details/{{YYYY-MM-DD}}-<topic>-details.md` with specifications for each task. The plan file contains checkboxes organized into phases with cross-references to the details file using line numbers. Task Planner validates that research exists before it proceeds — that is a mandatory first step, not optional.

The plan becomes a contract. Because Task Planner cannot implement, it focuses entirely on sequencing, dependencies, and success criteria. The output is precise enough that Task Implementor can execute it without improvisation.

**Implement** transforms strategy into working code. The Task Implementor agent reads the plan phase by phase, task by task. It loads only the detail sections it needs using line ranges from the plan's cross-references. It writes code following workspace conventions discovered during research, tracks every modification in a changes log at `.copilot-tracking/changes/{{YYYY-MM-DD}}-<topic>-changes.md`, and verifies success criteria before marking each task complete. Stop controls let you pause execution after each phase (`phaseStop=true`, the default) or after each individual task (`taskStop=true`) for human review.

**Review** transforms working code into validated code. The Task Reviewer agent locates the research document, plan, and changes log, then validates the implementation against all three. It checks convention compliance using instruction files, runs validation commands (lint, build, test), and documents findings with severity levels — Critical, Major, or Minor. The output is a review log at `.copilot-tracking/reviews/{{YYYY-MM-DD}}-<topic>-review.md` with an overall status: Complete, Needs Rework, or Blocked. If the review identifies gaps, the feedback loop returns to Research or Plan for a corrective cycle.

#### Content: The Agent Files and Handoff Contracts

Each RPI agent lives under `.github/agents/hve-core/` in the repository. The four primary agents are:

- `task-researcher.agent.md` — "Task research specialist for comprehensive project analysis"
- `task-planner.agent.md` — "Implementation planner for creating actionable implementation plans"
- `task-implementor.agent.md` — "Executes implementation plans from .copilot-tracking/plans with progressive tracking and change records"
- `task-reviewer.agent.md` — "Reviews completed implementation work for accuracy, completeness, and convention compliance"

These agents also have supporting subagents under `.github/agents/hve-core/subagents/`. The `researcher-subagent.agent.md` handles delegated search operations. The `plan-validator.agent.md` validates plans against research documents. The `phase-implementor.agent.md` executes individual phases. The `implementation-validator.agent.md` validates implementation quality. The `rpi-validator.agent.md` validates changes logs against plans and research.

The data flow is file-based, not chat-based. Research produces a markdown file. Plan reads that file and produces two more. Implement reads the plan files and produces code plus a changes log. Review reads all prior artifacts and produces a review log. The `.copilot-tracking/` directory is the shared workspace:

```text
.copilot-tracking/
├── research/    → Task Researcher output
├── plans/       → Task Planner output (plan + instructions)
├── details/     → Task Planner output (specifications)
├── changes/     → Task Implementor output
└── reviews/     → Task Reviewer output
```

The critical operational rule: use `/clear` or start a new chat between every phase. Each agent has different instructions and behavioral constraints. Accumulated context from a prior phase causes the model to ignore the current agent's instructions. Research findings persist in files, not in chat history, so clearing context costs nothing and lets each agent work optimally. The workflow sequence is: Task Researcher → `/clear` → Task Planner → `/clear` → Task Implementor → `/clear` → Task Reviewer.

#### Content: Prompt Shortcuts and the RPI Agent

Each phase has a corresponding prompt shortcut. The prompt files live under `.github/prompts/hve-core/`:

- `/task-research <topic>` — invokes `task-research.prompt.md`, automatically switches to Task Researcher
- `/task-plan` — invokes `task-plan.prompt.md`, automatically switches to Task Planner
- `/task-implement` — invokes `task-implement.prompt.md`, automatically switches to Task Implementor
- `/task-review` — invokes `task-review.prompt.md`, automatically switches to Task Reviewer

These shortcuts eliminate the manual step of selecting an agent from the picker dropdown. Type the slash command, and Copilot activates the correct agent with the prompt's context.

For tasks where you want the full RPI cycle without manual phase transitions, the `rpi-agent` at `.github/agents/hve-core/rpi-agent.agent.md` acts as an autonomous orchestrator. Its description reads: "Autonomous RPI orchestrator running Research → Plan → Implement → Review → Discover phases, using specialized subagents when task difficulty warrants them." The `rpi-agent` manages the full pipeline in a single session, delegating to the phase-specific subagents as needed. It suits tasks where you trust the automation and do not need to review each phase's output before proceeding.

#### Content: When to Use Full RPI

The RPI documentation provides a clear decision table. Use full four-phase RPI when changes span multiple files, when you are learning new patterns or APIs, when external dependencies are involved, or when requirements are unclear. Use individual agents or quick edits when fixing a typo, adding a log statement, or refactoring fewer than 50 lines where the change is obvious.

The rule of thumb from the docs: if you need to understand something before implementing, use RPI. If you already know exactly what to change, skip directly to implementation.

Three options exist on the RPI spectrum. Full manual RPI gives you maximum control — you review research before planning, review the plan before implementing, and review the implementation before committing. The `rpi-agent` orchestrator runs all phases autonomously for medium-complexity tasks where you trust the pipeline. Individual agents let you pick only the phase you need — run Task Researcher alone to investigate an unfamiliar API, or run Task Reviewer alone to validate work you implemented manually.

#### Outro

RPI separates AI work into four constrained phases, each handled by a specialized agent that produces a file-based artifact consumed by the next phase. Task Researcher produces evidence-backed research. Task Planner transforms that into a phased plan with success criteria. Task Implementor executes the plan with change tracking and stop controls. Task Reviewer validates the result against all prior artifacts. Module 4 covers collections — the packaging system that bundles these agents with prompts, instructions, and skills into distributable products.

### Key Talking Points

- RPI is a type transformation pipeline: Uncertainty → Knowledge → Strategy → Working Code → Validated Code
- Each phase has a dedicated agent file under `.github/agents/hve-core/` with phase-specific constraints
- Artifacts hand off through `.copilot-tracking/` directories: research/, plans/, details/, changes/, reviews/
- Always `/clear` context between phases — research findings persist in files, not chat history
