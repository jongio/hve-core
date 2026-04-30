# Module 12: The Validation Infrastructure

## Episode 12 | Semester 4: Operations and Mastery

### Learning Objectives

- Enumerate the linters and validators that compose HVE Core's quality pipeline
- Explain how JSON Schema validation enforces frontmatter correctness across artifact types
- Trace the execution order of the `lint:all` pipeline and identify each validation pass
- Describe how automated validation prevents structural entropy in a large artifact library

### Narration Script

#### Intro

HVE Core contains over 500 prompt engineering artifacts — agents, instructions, prompts, skills, and documentation files — all expressed as structured Markdown with YAML frontmatter. Without automated validation, a library of that size drifts into inconsistency within weeks. This module examines the validation infrastructure that prevents that drift: the individual linters, the schema enforcement layer, and the orchestrated pipeline that chains them together.

#### Objectives

Module 12 covers four areas. First, the linter inventory — every validation tool registered in `package.json` and what each one checks. Second, the frontmatter schema validation system that maps JSON Schemas to artifact types. Third, the `lint:all` pipeline that chains validation passes into a single command. Fourth, the design rationale — why this level of validation infrastructure exists and what happens without it.

#### Content: The Linter Inventory

Open `package.json` and look at the `scripts` section. HVE Core registers over twenty validation commands, each targeting a specific quality dimension. The Markdown layer uses `markdownlint-cli2` via the `lint:md` script, enforcing formatting rules defined in `.markdownlint-cli2.jsonc` and `.markdownlint.json`. The configuration excludes generated content — plugin outputs, extension READMEs, agent files, and test fixtures — to avoid false positives on files that follow different structural conventions. A custom rule package, `markdownlint-rule-search-replace`, extends the default ruleset with project-specific pattern checks.

Table formatting gets its own pass. The `format:tables` script runs `markdown-table-formatter` across all Markdown files, normalizing column alignment and spacing. This runs before `lint:md` in the `lint:all` pipeline because inconsistent table formatting would trigger Markdown lint failures.

PowerShell validation uses `PSScriptAnalyzer` via `lint:ps`, which runs `scripts/linting/Invoke-PSScriptAnalyzer.ps1`. YAML files are validated by `lint:yaml` through `scripts/linting/Invoke-YamlLint.ps1`, using the `PowerShell-Yaml` module. Python code is linted by `lint:py` via `scripts/linting/Invoke-PythonLint.ps1`. Spell checking runs `cspell` across Markdown, TypeScript, JavaScript, JSON, and YAML files. Link validation operates at two levels: `lint:links` checks language-specific link paths using `scripts/linting/Invoke-LinkLanguageCheck.ps1`, while `lint:md-links` runs `markdown-link-check` against a configuration file at `scripts/linting/markdown-link-check.config.json` to verify that URLs resolve.

The security-focused linters form their own group. `lint:version-consistency` runs `scripts/security/Test-ActionVersionConsistency.ps1` to verify that GitHub Actions pinned to SHA references use consistent versions across all workflow files. `lint:permissions` executes `scripts/security/Test-WorkflowPermissions.ps1` to enforce least-privilege permission declarations. `lint:dependency-pinning` runs `scripts/security/Test-DependencyPinning.ps1` to catch unpinned dependencies. `lint:ps-module-pins` uses `scripts/security/Test-PSModulePins.ps1` to verify that PowerShell module imports specify exact versions. These four scripts collectively enforce the supply chain security posture that CI depends on.

Two additional validators target HVE Core's specific artifact types. `lint:collections-metadata` runs `scripts/collections/Validate-Collections.ps1` to verify collection manifest files — the YAML files in the `collections/` directory that define which artifacts ship in each extension variant. `lint:marketplace` runs `scripts/plugins/Validate-Marketplace.ps1` to validate the marketplace metadata used during extension publishing. `lint:ai-artifacts` runs `scripts/linting/Validate-PlannerArtifacts.ps1` to verify planner artifact integrity. `validate:skills` executes `scripts/linting/Validate-SkillStructure.ps1` to check that skill directories conform to the expected layout. `validate:copyright` runs `scripts/linting/Test-CopyrightHeaders.ps1` to enforce copyright and SPDX license headers on source files — a requirement for OpenSSF Best Practices badge compliance.

#### Content: Frontmatter Schema Validation

The `lint:frontmatter` script is the most architecturally significant validator. It runs `scripts/linting/Validate-MarkdownFrontmatter.ps1` with the `-WarningsAsErrors` and `-EnableSchemaValidation` flags. This script validates that every Markdown file in the repository carries correct YAML frontmatter — the metadata block at the top of each file that declares title, description, author, date, topic type, and keywords.

The schema mapping lives in `scripts/linting/schemas/schema-mapping.json`. This file defines a set of pattern-to-schema rules that determine which JSON Schema applies to which files. Root community files — `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `SUPPORT.md` — are validated against `root-community-frontmatter.schema.json`. Documentation files under `docs/` use `docs-frontmatter.schema.json`. Each GitHub Copilot artifact type maps to its own schema: `.instructions.md` files validate against `instruction-frontmatter.schema.json`, `.prompt.md` files against `prompt-frontmatter.schema.json`, `.agent.md` files against `agent-frontmatter.schema.json`, `.chatmode.md` files against `chatmode-frontmatter.schema.json`, and `SKILL.md` files against `skill-frontmatter.schema.json`. Any file that does not match a specific pattern falls back to `base-frontmatter.schema.json`.

The base schema defines the shared contract. It requires `title` (non-empty string), `description` (non-empty string), `author`, and `ms.date` (ISO 8601 date in YYYY-MM-DD format). The `ms.topic` field is an enum restricted to values like `overview`, `concept`, `tutorial`, `reference`, `how-to`, `troubleshooting`, `research`, `guide`, `hub-page`, and `architecture`. The `keywords` field accepts an array of strings. The `estimated_reading_time` field accepts a positive integer. Artifact-specific schemas extend this base with additional required fields — for example, the agent schema requires `description` and supports fields like `agents` (subagent allowlist), `name`, and `argument-hint`.

This schema-per-artifact-type approach means the validation system understands what an agent file should look like versus what a prompt file should look like. A missing `description` field in an agent file is caught before it reaches code review. A misspelled `ms.topic` value is rejected against the enum constraint. Date formats that deviate from ISO 8601 fail the pattern check. The schema layer converts what would otherwise be subjective review feedback into deterministic pass/fail checks.

The validator also checks structural concerns beyond frontmatter fields. It validates the presence of the standard Copilot attribution footer on applicable files. It excludes files that legitimately lack frontmatter — changelog files, pull request templates, plugin outputs, and test fixtures — using configurable exclusion paths. It supports a `ChangedFilesOnly` mode for CI, comparing against `origin/main` to validate only files modified in a pull request rather than scanning the entire repository.

#### Content: The lint:all Pipeline

The `lint:all` command chains fifteen validation passes into a single sequential pipeline. The execution order is deliberate. It runs `format:tables` first to normalize table formatting, then `lint:md` to validate Markdown structure, then `lint:ps` for PowerShell analysis, `lint:yaml` for YAML validation, `lint:links` for link-language checks, `lint:frontmatter` for schema-aware frontmatter validation, `lint:collections-metadata` for collection manifests, `lint:marketplace` for marketplace metadata, `lint:version-consistency` for action SHA consistency, `lint:permissions` for workflow permissions, `lint:dependency-pinning` for dependency pinning, `lint:ps-module-pins` for PowerShell module pinning, `lint:py` for Python linting, `validate:skills` for skill directory structure, and `lint:ai-artifacts` for planner artifact validation.

The ordering reflects dependency relationships. Table formatting must run before Markdown linting because unformatted tables trigger lint violations. Frontmatter validation runs after Markdown linting because structurally invalid Markdown could produce misleading frontmatter parse results. Security checks run as a group. The pipeline uses `&&` chaining in `package.json`, meaning the first failure stops execution. This fail-fast behavior is intentional — there is no value in reporting downstream lint failures when an upstream structural problem invalidates the file being checked.

Contributors run `npm run lint:all` locally before pushing. The CONTRIBUTING.md file lists this as the primary pre-submission command. The same pipeline executes in CI via the `pr-validation.yml` workflow, which calls individual reusable workflow files for each validation category. The PR validation workflow also adds checks not in `lint:all` — copyright header validation, fuzz tests, pip-audit for Python dependencies, and Pester tests for PowerShell scripts.

#### Content: Preventing Structural Entropy

A prompt engineering library differs from a typical codebase in an important way: there is no compiler. A malformed agent definition does not produce a build error. A prompt file with an incorrect `ms.topic` value still functions — it just silently produces wrong metadata. Without explicit validation, the library accumulates inconsistencies through normal development. Contributors copy an existing file, modify it, and inadvertently omit a required field. Reviewers miss the omission because the file looks structurally similar to its neighbors.

The validation infrastructure addresses this by encoding structural expectations as executable checks. The thirteen JSON Schemas in `scripts/linting/schemas/` define what correct looks like for each artifact type. The twenty-plus npm scripts make validation accessible to any contributor with a Node.js environment. The `lint:all` pipeline makes comprehensive validation a single command. The CI workflows make validation non-optional — pull requests cannot merge until all checks pass.

The `.markdownlint-cli2.jsonc` configuration demonstrates the granularity of this approach. It excludes `node_modules`, `packages`, tracking directories, log files, virtual environments, test fixtures, generated extension files, plugin content, and GitHub artifact directories from Markdown linting. It loads a custom rule package and configures two output formatters — the default console formatter for developer feedback and a JSON formatter that writes results to `logs/markdownlint-results.json` for CI artifact collection. Each exclusion exists because someone encountered a false positive and the team decided the exclusion was correct rather than modifying the content.

This is what validation infrastructure looks like at scale. It is not a single linter with a configuration file. It is a system of specialized validators, each with its own exclusion rules and output formats, orchestrated through a pipeline that runs identically on developer machines and in CI.

#### Outro

Three takeaways from this module. First, HVE Core's validation infrastructure includes over fifteen distinct linting and validation passes covering Markdown formatting, spell checking, link integrity, YAML structure, PowerShell analysis, Python quality, frontmatter schema conformance, collection metadata, marketplace metadata, skill directory structure, action version consistency, workflow permissions, dependency pinning, PowerShell module pins, and AI artifact integrity. Second, the frontmatter validation system uses a schema-mapping architecture — `schema-mapping.json` routes files to type-specific JSON Schemas based on path patterns, so each artifact type is validated against its own structural contract. Third, the `lint:all` pipeline chains these validators in dependency order with fail-fast behavior, and the same checks run in CI workflows to make validation non-optional.

Module 13 examines how validated artifacts become distributable extension packages through the Prepare and Package pipeline and how CI/CD workflows manage the full release lifecycle.

### Key Talking Points

- HVE Core registers 20+ validation scripts in `package.json` covering Markdown, PowerShell, YAML, Python, spelling, links, frontmatter, collections, marketplace, security, and AI artifacts
- `lint:frontmatter` uses `Validate-MarkdownFrontmatter.ps1` with `-EnableSchemaValidation` to validate against type-specific JSON Schemas
- `scripts/linting/schemas/schema-mapping.json` maps file path patterns to 7 artifact-specific schemas plus a base fallback schema
- The base schema enforces `title`, `description`, `author`, `ms.date` (ISO 8601), `ms.topic` (enum), `keywords`, and `estimated_reading_time`
- Agent, prompt, instruction, chatmode, skill, docs, and root-community files each have their own schema with type-specific required fields
- `lint:all` chains 15 validation passes in dependency order with `&&` fail-fast chaining
- `format:tables` runs before `lint:md` because unformatted tables trigger Markdown lint violations
- Security linters check action SHA consistency, workflow permissions, dependency pinning, and PowerShell module pins
- `.markdownlint-cli2.jsonc` configures exclusion paths and dual output formatters (console + JSON for CI artifacts)
- PR validation in CI adds copyright headers, fuzz tests, pip-audit, and Pester tests beyond what `lint:all` covers
- Validation prevents structural entropy in a library with no compiler — schema checks catch drift that code review misses
