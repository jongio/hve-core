# Module 9: Writing Custom Artifacts

## Episode 09 | Semester 3: Authoring and Customization

### Learning Objectives

- Construct instruction files with valid frontmatter schema and applyTo targeting
- Define agent files with system prompts, tool declarations, subagent references, and handoff configuration
- Create prompt files with slash-command activation, agent delegation, and mode configuration
- Register artifacts in collection manifests and validate them through the lint pipeline

### Narration Script

#### Intro

HVE Core ships with a library of instructions, agents, and prompts. But the architecture is designed for extension. Every artifact follows a strict file convention—frontmatter schema, naming rules, directory placement—and a validation pipeline catches deviations before they reach users. This module walks through constructing each artifact type from scratch, registering it in a collection manifest, and running the full validation suite.

#### Objectives

Module 9 covers four artifact types: instructions, agents, prompts, and skills. For each type, we examine the required frontmatter fields, optional metadata, file naming conventions, and directory placement rules. We then cover collection manifest registration and the lint pipeline that enforces structural correctness across the entire repository.

#### Content: The Artifact System

HVE Core organizes AI artifacts under `.github/` in four directories: `instructions/`, `agents/`, `prompts/`, and `skills/`. Each directory is subdivided by collection ID—the grouping that determines how artifacts are packaged and distributed. The file suffix identifies the artifact type: `.instructions.md`, `.agent.md`, `.prompt.md`, and `SKILL.md` for skills. All filenames use lowercase kebab-case. No exceptions.

Every artifact file starts with YAML frontmatter between `---` delimiters. The frontmatter drives discovery, targeting, and validation. Each artifact type has its own JSON schema under `scripts/linting/schemas/`—`instruction-frontmatter.schema.json`, `agent-frontmatter.schema.json`, `prompt-frontmatter.schema.json`, and `skill-frontmatter.schema.json`. A `schema-mapping.json` file maps file suffixes to schemas so the validation pipeline knows which schema to apply to which file.

The maturity system applies at both the collection level and the individual item level. Four tiers exist: `stable`, `preview`, `experimental`, and `deprecated`. Maturity controls visibility and packaging decisions. Deprecated artifacts move to `.github/deprecated/{type}/` and are excluded from active collections.

#### Content: Constructing Instruction Files

Instruction files live at `.github/instructions/{collection-id}/*.instructions.md`. They inject context into Copilot's prompt when files matching their `applyTo` pattern are in scope.

The required frontmatter fields are `description` and `applyTo`. The `description` field is a string between 10 and 200 characters that explains what the instruction does. The `applyTo` field is a glob pattern—or comma-separated list of globs—that determines when the instruction activates. Patterns are evaluated relative to the repository root. Examples: `**/*.py` targets all Python files, `**/src/**/*.ts` targets TypeScript files under any `src/` directory, and `**/*.{js,ts,jsx,tsx}` targets the full JavaScript ecosystem.

Optional frontmatter fields include `version` (semantic version matching `^\d+\.\d+(\.\d+)?$`), `author` (contributor attribution), and `lastUpdated` (ISO 8601 date in `YYYY-MM-DD` format).

The body of the instruction file contains the actual guidance injected into context. Write it as direct instructions to the AI—declarative statements about coding conventions, architectural constraints, or domain rules. XML blocks with kebab-case tags (`<!-- <example-usage> -->`) structure complex instruction content. Tags must be matched pairs with unique names within the file.

Instruction stacking follows a defined precedence: `copilot-instructions.md` loads first as a base layer, then broad `applyTo` patterns, then specific patterns. When instructions conflict, the more specific pattern wins.

One important exclusion rule: root-level instructions directly under `.github/instructions/` (not in a collection subdirectory) are repo-specific and excluded from collection packaging. Only instructions under a collection subdirectory are distributable.

#### Content: Defining Agent Files

Agent files live at `.github/agents/{collection-id}/*.agent.md`, with subagents in a `subagents/` subdirectory. The file body is the agent's system prompt—the instructions that define its identity, behavior, and capabilities.

The only required frontmatter field is `description` (10–200 characters). But agents have a rich set of optional fields that control their behavior. The `tools` field is an array of tool access grants. Tool names follow four patterns: individual tools (exact name), categories (`read`, `search`, `edit`, `web`, `agent`), category-specific (`edit/createFile`, `execute/runInTerminal`), and wildcards (`github/*`, `ado/*`). Use read-only tool sets for agents that should not mutate state.

The `agents` field is an array of subagent names. When you declare subagents, include the `agent` tool in the `tools` array so the parent agent can invoke them. Subagents set `user-invocable: false` in their frontmatter to prevent direct user access—they are only reachable through their parent agent.

The `model` field specifies the preferred AI model (string or array). All agents must target the latest Anthropic or OpenAI models. The `target` field is an enum—`vscode` or `github-copilot`—that controls where the agent is available. For agents targeting `github-copilot`, the `mcp-servers` field declares Model Context Protocol server dependencies.

The `handoffs` field (VS Code 1.106+) is an array of objects that define agent-to-agent transitions. Each handoff entry has `label` (display name), `agent` (target agent name), and optionally `prompt`, `send`, and `model` fields. The `disable-model-invocation` boolean, when set to `true`, prevents the model from autonomously invoking the agent—useful for orchestrator agents that should only be triggered explicitly.

The system prompt body defines the agent's identity, workflow phases, instruction references, and behavioral constraints. Agents reference instruction files that are automatically loaded based on `applyTo` matching, and can explicitly load additional files via `read_file` tool calls for on-demand context injection.

#### Content: Creating Prompt Files

Prompt files live at `.github/prompts/{collection-id}/*.prompt.md`. They define slash commands—user-invokable actions that appear in Copilot's command palette.

The required frontmatter field is `description` (10–200 characters). The `agent` field delegates execution to a named custom agent. The `mode` field is an enum with four values: `agent` (full agent capabilities), `assistant` (conversational), `copilot` (code completion context), and `workflow` (multi-step orchestration).

The `argument-hint` field defines the syntax shown in the VS Code command picker. It supports three patterns: positional arguments in brackets (`[project-name]`), named parameters (`key=value`), and enum choices in braces (`{capture|from-prd|from-brd}`). These hints guide users toward correct invocation.

Input variables use the syntax `${input:variableName}` or `${input:variableName:defaultValue}` for variables with defaults. These create dynamic prompts where user input is interpolated at invocation time.

The prompt body after the frontmatter contains the entry instruction—the initial message sent to the agent or model. An optional `---` separator divides the frontmatter from the activation content. For prompts that delegate to phased agents, the activation line often specifies which phase or mode to enter.

Additional optional fields mirror instruction metadata: `category` (lowercase kebab-case grouping), `version`, `author`, and `lastUpdated`.

#### Content: Building Skills

Skills are the most structurally complex artifact type. They live at `.github/skills/{collection-id}/{skill-name}/SKILL.md`—a directory-based structure where the main file must be named exactly `SKILL.md`.

Required frontmatter includes `name` (lowercase kebab-case, must match the directory name) and `description` (a single sentence ending with an attribution suffix). Optional fields include `user-invocable`, `disable-model-invocation`, `argument-hint`, `license`, `compatibility`, and a `metadata` object containing `authors`, `spec_version`, `framework_revision`, `last_updated`, `skill_based_on`, and `content_based_on`.

The invocation matrix created by `user-invocable` and `disable-model-invocation` produces four combinations: fully accessible (both defaults), user-only (disable model invocation), model-only (not user invocable), and internal-only (neither). This matrix controls exactly how and by whom a skill can be triggered.

Skills can include executable scripts. If scripts are present, at least one `.ps1` file is required, with `.sh` recommended for cross-platform portability. All internal paths must be relative to the skill root directory—never repo-root-relative. A `tests/` directory is required when scripts exist: Pester `.Tests.ps1` for PowerShell, `test_*.py` plus optional `tests/fuzz_harness.py` for Python.

#### Content: Collection Manifests and Validation

Every distributable artifact must be registered in a collection manifest at `collections/{collection-id}.collection.yml`. The manifest schema is defined in `collection-manifest.schema.json`.

Top-level manifest fields are `id` (lowercase, hyphens only, regex `^[a-z0-9-]+$`), `name`, `description`, `maturity` (defaults to `stable`), `tags` (array of strings), `items` (array of artifact entries), and `display` (with `ordering` for UI presentation). Each item in `items` has three fields: `path` (relative to repo root), `kind` (enum: `agent`, `prompt`, `instruction`, `skill`, `hook`), and `maturity` (item-level override). Subagents referenced by parent agents must also appear in the manifest—missing subagent entries cause validation failures.

The `hve-core-all` collection is the canonical superset of all stable artifacts and must be updated whenever artifacts are added, removed, or deprecated.

The validation pipeline runs through `npm run lint:all`, which chains together over a dozen individual checks. The key commands for artifact authoring are:

- `npm run lint:frontmatter` — validates frontmatter against JSON schemas with `EnableSchemaValidation` flag
- `npm run lint:collections-metadata` — runs `Validate-Collections.ps1` to enforce manifest rules
- `npm run plugin:validate` — alias for collection validation
- `npm run validate:skills` — runs `Validate-SkillStructure.ps1` for skill directory conventions
- `npm run lint:md` — Markdown linting
- `npm run lint:yaml` — YAML syntax validation
- `npm run lint:ps` — PowerShell script linting

The collection validation script (`scripts/collections/Validate-Collections.ps1`) enforces: required fields (`id`, `name`, `description`, `items`), ID regex compliance, duplicate ID detection, allowed maturity values, artifact file existence, kind-to-suffix consistency (an `agent` kind must reference a `.agent.md` file), skill paths containing `SKILL.md`, and exclusion of repo-specific root artifacts from collections.

After validation passes, `npm run plugin:generate` runs `Generate-Plugins.ps1` to produce the distributable plugin packages. Always validate before generating.

#### Outro

Three takeaways from this module. First, every artifact type has a strict contract—required frontmatter fields, naming conventions, and directory placement—enforced by JSON schemas and validation scripts. Second, the collection manifest is the packaging boundary: if an artifact is not registered in a manifest, it does not ship. Third, the validation pipeline (`npm run lint:all`) is your pre-commit gate; run it early and often during authoring.

Module 10 shifts from individual artifacts to coordinated artifact systems. The Design Thinking framework demonstrates how agents, instructions, and prompts compose into a nine-method coaching workflow—the most complex artifact collection in HVE Core.

### Key Talking Points

- Four artifact types: instructions (`.instructions.md`), agents (`.agent.md`), prompts (`.prompt.md`), skills (`SKILL.md`)
- All frontmatter validated against JSON schemas in `scripts/linting/schemas/`
- `applyTo` field on instructions uses repo-root-relative glob patterns for automatic context injection
- Agent `tools` field supports four grant patterns: individual, category, category-specific, and wildcard
- Prompt `mode` enum: `agent`, `assistant`, `copilot`, `workflow`
- Skills use directory-based structure with mandatory `SKILL.md` entry point
- Collection manifests (`collections/*.collection.yml`) require `id`, `name`, `description`, `items`
- Manifest item `kind` enum: `agent`, `prompt`, `instruction`, `skill`, `hook`
- Validation pipeline: `npm run lint:all` chains frontmatter, collection, skill, Markdown, YAML, and PowerShell checks
- `npm run plugin:validate` then `npm run plugin:generate` for packaging
- Maturity tiers: `stable`, `preview`, `experimental`, `deprecated`
- Subagents must be registered in manifests alongside parent agents
