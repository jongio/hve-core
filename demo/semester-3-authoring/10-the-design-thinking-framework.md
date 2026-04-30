# Module 10: The Design Thinking Framework

## Episode 10 | Semester 3: Authoring and Customization

### Learning Objectives

- Map the nine-method design thinking sequence across Problem, Solution, and Implementation spaces
- Explain how the DT Coach agent orchestrates method progression through coaching state management
- Distinguish between method-tier and deep-tier instruction architecture
- Configure industry context files for domain-specific adaptation
- Trace the DT-to-RPI handoff contract from design thinking outputs to implementation planning

### Narration Script

#### Intro

The Design Thinking collection is the most architecturally complex artifact system in HVE Core. It coordinates two agents, over forty instruction files, and fifteen prompts into a nine-method coaching framework that guides teams from problem discovery through implementation readiness. This module examines how the collection's artifact architecture implements a structured creative process—and how the DT Coach agent manages state, loads context on demand, and hands off to the RPI planning system.

#### Objectives

Module 10 covers five areas: the nine-method sequence and its three-space organization, the DT Coach agent's orchestration architecture, the two-tier instruction system that separates method overviews from deep expertise, industry context files for domain adaptation, and the handoff contract that bridges design thinking outputs into RPI implementation planning.

#### Content: The Nine-Method Sequence

The Design Thinking framework divides into three spaces, each containing three methods. This is not arbitrary—the spaces represent fundamentally different cognitive modes, and the methods within each space build on each other sequentially.

**Problem Space** contains Methods 1 through 3. Method 1 is **Scope Conversations**—establishing project boundaries, stakeholder identification, and constraint mapping. Method 2 is **Design Research**—gathering evidence through user interviews, observation, and contextual inquiry. Method 3 is **Input Synthesis**—transforming raw research into patterns, insights, and opportunity statements. The Problem Space is about understanding, not deliverables. The quality constraints here emphasize multi-source validation, evidence over opinion, and real-environment observation.

**Solution Space** contains Methods 4 through 6. Method 4 is **Brainstorming**—divergent idea generation followed by convergence. Method 5 is **User Concepts**—shaping selected ideas into evaluable concept descriptions. Method 6 is **Low-Fidelity Prototypes**—building scrappy, testable representations of concepts. The Solution Space prioritizes idea variety, instant failure as a learning signal, and anti-polish—the "too nice prototype" warning flags when teams over-invest in fidelity before validation.

**Implementation Space** contains Methods 7 through 9. Method 7 is **High-Fidelity Prototypes**—building functionally rigorous representations for realistic testing. Method 8 is **User Testing**—structured evaluation with real users against defined success criteria. Method 9 is **Iteration at Scale**—incorporating test findings into refined designs and preparing implementation specifications. The Implementation Space shifts from creative exploration to engineering rigor, though visual polish remains secondary to functional correctness.

The method sequence is defined in `dt-method-sequencing.instructions.md`, which the DT Coach loads as an ambient instruction. The sequencing file maps each method number to its name and space, establishing the progression contract that the coaching state protocol enforces.

#### Content: The DT Coach Agent

The DT Coach agent (`dt-coach.agent.md`) is the primary orchestrator of the design thinking process. Its system prompt establishes three core principles: **Think** (guide discovery through questions), **Speak** (short, conversational responses), and **Empower** (help teams find answers rather than providing them). The coach operates within coaching boundaries—discovery, not execution. It asks questions, surfaces frameworks, and provides progressive hints, but it does not generate deliverables or make design decisions for the team.

The agent loads four categories of instructions through different mechanisms. **Ambient instructions** load automatically for every interaction: `dt-coaching-identity.instructions.md` (persona and behavioral rules), `dt-quality-constraints.instructions.md` (space-specific quality standards), `dt-method-sequencing.instructions.md` (the nine-method map), and `dt-coaching-state.instructions.md` (state management protocol). These establish the coach's persistent identity and operational rules.

**Method-tier instructions** load based on the current method. When the team is in Method 4 (Brainstorming), the instruction file `dt-method-04-brainstorming.instructions.md` activates. These files define the method's purpose, coaching approach, key activities, deliverables, and transition criteria. Each method-tier file gives the coach enough context to guide the team through that specific method without loading the full depth of expertise.

**Deep-tier instructions** are loaded on demand via `read_file` tool calls. When the coach encounters a situation requiring advanced expertise—recovery from a stalled brainstorm, handling power dynamics in scope conversations, cross-domain ideation techniques—it reads the corresponding deep file (e.g., `dt-method-04-deep.instructions.md`). This on-demand loading keeps the base context window lean while providing access to detailed guidance when needed.

**Industry context instructions** provide domain-specific vocabulary, constraints, and reference scenarios. Files like `dt-industry-healthcare.instructions.md` and `dt-industry-manufacturing.instructions.md` map design thinking terminology to industry language and surface domain-specific considerations like HIPAA compliance, patient safety protocols, OSHA requirements, or shift-based manufacturing constraints.

The coach uses a technique called **hat-switching**—adapting its expertise to the current method without changing its core identity. In Method 1, the coach wears a facilitator hat focused on stakeholder dynamics. In Method 4, it shifts to a creativity catalyst hat. The identity remains consistent; the domain expertise rotates.

A second agent, the **DT Learning Tutor** (`dt-learning-tutor.agent.md`), serves a different purpose. Where the DT Coach is project-driven—guiding a real design thinking engagement—the Learning Tutor is syllabus-driven. It teaches the nine methods through structured modules with comprehension checks, adapting to beginner, intermediate, and advanced skill levels. When a learner is ready to apply their knowledge to a real project, the Learning Tutor hands off to the DT Coach.

#### Content: Coaching State Management

The DT Coach maintains persistent state at `.copilot-tracking/dt/{project-slug}/coaching-state.md`. This file is the single source of truth for where a project stands in the design thinking process.

The state structure tracks several dimensions. The `project` field identifies the engagement. The `current` object holds `method` (1–9), `space` (derived from method—1–3 maps to Problem, 4–6 to Solution, 7–9 to Implementation), and `phase` (the substep within the current method). The `methods_completed` array records which methods have been finished. The `transition_log` captures every method-to-method transition with timestamps and rationale. The `hint_calibration` tracks the team's responsiveness to coaching prompts—enabling the progressive hint engine to adjust its approach. The `session_log` records individual coaching interactions, and `artifacts` tracks deliverables produced during each method.

The space derivation is automatic: the coach calculates the space from the method number rather than storing it independently. This prevents state inconsistencies where the method and space could drift apart.

State management follows a strict protocol. On session start, the coach reads the existing state file. If the file exists, it resumes from the recorded position. If not, it initializes a new project at Method 1. Every transition—method advance, phase change, artifact creation—triggers a state write. The transition log provides an audit trail that supports the coach's ability to explain why the team is at a particular point in the process.

The coaching state protocol also drives the prompt system. The `/dt-start-project` prompt initializes a new design thinking engagement, creating the state file and beginning Method 1. The `/dt-resume-coaching` prompt reads existing state and resumes. The `/dt-method-next` prompt advances to the next method after validating that transition criteria are met.

#### Content: Two-Tier Instruction Architecture

The design thinking collection implements a two-tier instruction architecture that balances context efficiency with depth of expertise. This pattern is worth studying because it solves a fundamental constraint: AI context windows are finite, but design thinking expertise is deep.

**Method-tier files** provide the working-level guidance for each method. There are nine of these, one per method: `dt-method-01-scope.instructions.md` through `dt-method-09-iteration.instructions.md`. Each file covers the method's purpose, the coach's approach, key activities and their sequencing, expected deliverables, quality criteria, and transition conditions to the next method. These files are concise enough to fit in the active context alongside the ambient instructions.

**Deep-tier files** extend method-tier guidance with advanced protocols. There are nine deep files as well: `dt-method-01-deep.instructions.md` through `dt-method-09-deep.instructions.md`. The Method 1 deep file covers advanced scoping techniques, power dynamics in stakeholder conversations, and manufacturing-specific scope patterns. The Method 4 deep file covers brainstorm recovery techniques, convergence facilitation, and cross-domain transfer methods. Deep files are not loaded by default—the coach reads them via `read_file` when it encounters a situation that exceeds the method-tier guidance.

This architecture means the DT Coach operates in two modes. In standard coaching, it works from the ambient instructions plus the current method-tier file—a compact context load that handles the majority of interactions. When it hits an edge case or recognizes that the team needs advanced guidance, it selectively loads the relevant deep-tier file. The model decides when to escalate based on conversational signals: repeated struggles with a technique, explicit requests for advanced approaches, or domain-specific complications.

The curriculum instruction files (`dt-curriculum-01-scoping.instructions.md` through `dt-curriculum-09-handoff.instructions.md`) serve the Learning Tutor rather than the Coach. They restructure the same knowledge into a teaching format with learning objectives, explanations, and comprehension checks. This demonstrates how the same domain knowledge can be packaged into different instruction architectures for different agent purposes.

#### Content: Industry Context and Domain Adaptation

Industry context files extend the design thinking framework to specific domains without modifying the core methodology. Each industry file follows a consistent structure: an industry profile, a vocabulary mapping table, domain-specific constraints, adapted empathy tools, and a reference scenario.

The vocabulary mapping is the key mechanism. It translates design thinking terms into domain language. In healthcare, "user research" maps to "clinician shadowing" and "patient journey mapping." In manufacturing, "contextual inquiry" maps to "gemba walks" and "line observation." This translation layer means the coach can use domain-appropriate language without rewriting the underlying method instructions.

Domain constraints surface regulatory and operational realities. The healthcare context file flags HIPAA compliance requirements, patient safety considerations, and clinical workflow integration points. The manufacturing context file flags OSHA regulations, shift-based scheduling constraints, noise and contamination considerations, and equipment access limitations. These constraints inject into the coach's quality assessment—a prototype that ignores HIPAA is flagged regardless of its design quality.

The industry files also provide adapted empathy tools. Standard design thinking empathy techniques may not transfer directly to every domain. Healthcare requires specific patient interaction protocols. Manufacturing requires safety-compliant observation procedures. The industry files bridge this gap by providing domain-appropriate alternatives to standard techniques.

To add a new industry context, create a file following the established pattern at `.github/instructions/design-thinking/dt-industry-{domain}.instructions.md`, register it in the `design-thinking.collection.yml` manifest, and the DT Coach can load it when the team identifies their domain.

#### Content: DT-to-RPI Handoff

The design thinking process does not exist in isolation. Its outputs feed into the RPI (Research, Planning, Implementation) system for execution. The handoff contract defined in `dt-rpi-handoff-contract.instructions.md` specifies exactly how design thinking artifacts translate into RPI inputs.

The handoff can occur at three points, corresponding to the three space boundaries. After Problem Space completion (Method 3), the team has synthesized research into insights and opportunity statements. After Solution Space completion (Method 6), the team has validated concepts through low-fidelity prototyping. After Implementation Space completion (Method 9), the team has tested high-fidelity prototypes and produced implementation specifications.

All three exit points route to the same RPI entry point: the **Task Researcher** agent. Later exits provide richer context—a team that completes all nine methods hands off a fully validated design specification, while a team that exits after Problem Space hands off research insights that still need solution development.

The handoff summary follows a structured schema with confidence markers on every artifact: `validated` (confirmed through testing), `assumed` (reasonable but unverified), `unknown` (gaps identified but not filled), and `conflicting` (contradictory evidence found). These markers give the RPI system explicit information about which design decisions are solid and which need further investigation.

The handoff process uses a subagent workflow defined in `dt-subagent-handoff.instructions.md`. The workflow has three stages: readiness assessment (verifying the team has met transition criteria), compilation (assembling artifacts, constraints, and assumptions into the handoff format), and validation (confirming the handoff package is complete and internally consistent).

RPI context files—`dt-rpi-research-context.instructions.md`, `dt-rpi-planning-context.instructions.md`, and `dt-rpi-implement-context.instructions.md`—provide the receiving RPI agents with design thinking context. These files explain what design thinking artifacts mean in RPI terms, ensuring that the Task Researcher, Task Planner, and Task Implementer agents can correctly interpret and act on design thinking outputs.

Space-specific handoff prompts—`/dt-handoff-problem-space`, `/dt-handoff-solution-space`, and `/dt-handoff-implementation-space`—trigger the handoff workflow at each exit point. These prompts invoke the subagent handoff process and produce the structured handoff summary.

#### Outro

Three takeaways. First, the nine-method sequence across three spaces is not just a methodology—it is an architectural contract enforced through coaching state, method sequencing instructions, and transition criteria validation. Second, the two-tier instruction architecture solves the context window problem: method-tier files provide working guidance, deep-tier files provide on-demand expertise, and the coach decides when to escalate. Third, the DT-to-RPI handoff demonstrates how separate artifact systems can compose through structured contracts with confidence markers.

Module 11 examines a different architectural pattern: the security planning agents. Where Design Thinking uses a single coach agent with deep instruction layering, the security planners use three parallel agents—Security Planner, RAI Planner, and SSSC Planner—each implementing a six-phase workflow against different compliance frameworks.

### Key Talking Points

- Nine methods in three spaces: Problem (Scope Conversations, Design Research, Input Synthesis), Solution (Brainstorming, User Concepts, Low-Fidelity Prototypes), Implementation (High-Fidelity Prototypes, User Testing, Iteration at Scale)
- DT Coach agent operates on Think/Speak/Empower principles with hat-switching per method
- DT Learning Tutor is syllabus-driven, not project-driven—teaches methods then hands off to Coach
- Coaching state persists at `.copilot-tracking/dt/{project-slug}/coaching-state.md`
- State tracks current method, space (derived from method number), phase, transition log, hint calibration
- Two-tier instructions: method-tier (auto-loaded per method) and deep-tier (loaded on demand via read_file)
- Industry context files provide vocabulary mapping, domain constraints, and adapted empathy tools
- Three handoff exit points: after Problem Space, Solution Space, or Implementation Space
- All exits route to RPI Task Researcher; later exits carry richer validated context
- Handoff confidence markers: validated, assumed, unknown, conflicting
- Handoff prompts: `/dt-handoff-problem-space`, `/dt-handoff-solution-space`, `/dt-handoff-implementation-space`
- Collection manifest (`design-thinking.collection.yml`) registers 2 agents, 15 prompts, and 40+ instructions
