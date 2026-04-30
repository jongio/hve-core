# Module 06: Instructions — Auto-Applied Guidelines
## Episode 06 | Semester 2: The Four Artifact Types

### Learning Objectives
- Explain the auto-apply mechanism that activates instructions based on `applyTo` glob patterns
- Describe how directory organization separates shared guidelines from language-specific standards
- Demonstrate how multiple instructions compose and layer when matched to a single file
- Identify how frontmatter schema validation enforces consistency through CI

### Narration Script

#### Intro

Instructions are the most numerous artifact type in HVE Core. The repository contains 351 instruction files — roughly six times more than agents and five times more than prompts. Instructions use the `.instructions.md` extension and carry a single defining behavior: they activate automatically when Copilot detects that an open editor file matches their `applyTo` glob pattern. No user action is required. Open a `.cs` file and the C# instructions are already in context.

#### Objectives

Module 6 covers four areas. First, the auto-apply mechanism and how `applyTo` glob patterns drive activation. Second, directory organization and the distinction between shared guidelines and language-specific standards. Third, pattern composition — what happens when multiple instructions match the same file and how they layer together. Fourth, frontmatter schema validation through CI pipelines.

#### Content: The Auto-Apply Mechanism

Every instruction file has YAML frontmatter with two fields: `description` and `applyTo`. The `description` is a human-readable summary. The `applyTo` field is a glob pattern that tells VS Code which editor files should trigger this instruction.

When a developer opens a file in VS Code, Copilot evaluates the file's path against every instruction file's `applyTo` pattern. Every match adds that instruction's Markdown body to the model's context. The developer never selects instructions manually — the right guidelines activate based on what code is open.

The glob patterns range from broad to precise. The Bash instruction at `.github/instructions/coding-standards/bash/bash.instructions.md` declares `applyTo: '**/*.sh'` — matching any shell script anywhere in the repository. The C# instruction at `.github/instructions/coding-standards/csharp/csharp.instructions.md` uses `applyTo: '**/*.cs'`. The PowerShell instruction at `.github/instructions/coding-standards/powershell/powershell.instructions.md` uses `applyTo: '**/*.ps1, **/*.psm1, **/*.psd1'` — a comma-separated list matching three file extensions in a single pattern.

Some patterns target specific directories rather than file extensions. The Docusaurus instruction at `.github/instructions/docusaurus-edits.instructions.md` uses `applyTo: 'docs/**'`, activating for any file under the documentation directory regardless of extension. The GitHub Actions Workflow instruction at `.github/instructions/workflows.instructions.md` uses `applyTo: '**/.github/workflows/*.yml'` — a precise path that matches only workflow YAML files inside the `.github/workflows/` directory. The Pull Request instruction at `.github/instructions/pull-request.instructions.md` uses `applyTo: '**/.copilot-tracking/pr/**'`, targeting PR tracking artifacts specifically.

The Python script instruction at `.github/instructions/coding-standards/python-script.instructions.md` uses `applyTo: '**/*.py'`. The Python test instruction at `.github/instructions/coding-standards/python-tests.instructions.md` presumably matches test files with a more specific pattern. This shows how HVE Core separates general implementation guidelines from test-specific conventions, even within the same language.

#### Content: Directory Organization

The 351 instruction files in the `.github/instructions/` directory follow a hierarchical organization that reflects their domain scope. The top level contains three cross-cutting instructions: `docusaurus-edits.instructions.md` for documentation, `pull-request.instructions.md` for PR conventions, and `workflows.instructions.md` for GitHub Actions.

The `coding-standards/` subdirectory is the largest category, containing language-specific guidelines organized into their own subdirectories. The `bash/` subdirectory has `bash.instructions.md`. The `csharp/` subdirectory has both `csharp.instructions.md` and `csharp-tests.instructions.md`. The `powershell/` subdirectory has `powershell.instructions.md` and `pester.instructions.md` for test frameworks. The `rust/` subdirectory has `rust.instructions.md` and `rust-tests.instructions.md`. Additional subdirectories cover `bicep/`, `terraform/`, and `code-review/`. At the coding-standards root level, `python-script.instructions.md`, `python-tests.instructions.md`, and `uv-projects.instructions.md` provide Python and build tool conventions.

Platform integration instructions mirror the agent structure. The `ado/` directory contains nine instruction files for Azure DevOps workflows: backlog sprint planning, backlog triage, pull request creation, build info retrieval, interaction templates, work item updates, work item discovery, and work item planning. The `github/` directory has five instruction files covering community interaction, backlog discovery, backlog planning, backlog triage, and backlog updates. The `jira/` directory has a parallel set for Jira integration.

Domain-specific instruction sets are extensive. The `design-thinking/` directory alone contains over 30 instruction files covering the full design thinking curriculum — from scoping and research through synthesis, brainstorming, concepts, prototypes, testing, iteration, and handoff. Each curriculum stage has both a method instruction and a deep-dive instruction. Industry-specific instructions cover energy, healthcare, and manufacturing.

The `security/` directory holds instructions for security models, identity, operational buckets, SSSC standards, SSSC assessment, SSSC gap analysis, SSSC backlog, SSSC handoff, SSSC identity, standards mapping, and backlog handoff. The `rai-planning/` directory has a parallel structure for Responsible AI — capture coaching, identity, impact assessment, risk classification, security model, and standards.

The `hve-core/` subdirectory contains internal workflow instructions: commit message conventions, git merge procedures, markdown standards, prompt builder guidelines, pull request generation, and writing style.

The `shared/` directory holds cross-cutting instructions used across multiple domains: `disclaimer-language.instructions.md`, `hve-core-location.instructions.md`, and `story-quality.instructions.md`.

#### Content: Pattern Composition and Layering

When a developer opens a single file, multiple instruction files can match simultaneously. Copilot combines all matching instructions into the model's context. This means instructions compose additively — each matched file adds its guidelines without overriding others.

Consider a developer opening a Python test file at `tests/test_validator.py`. The `python-script.instructions.md` with `applyTo: '**/*.py'` matches because the file has a `.py` extension. The `python-tests.instructions.md` also matches with its Python test pattern. Both instruction bodies enter the context together. The base Python instruction provides general conventions — entry points, exit codes, import ordering, type hints. The test instruction adds test-specific conventions — fixture patterns, assertion styles, naming standards. Neither overrides the other; they stack.

The same composition occurs across domains. If a developer edits a workflow file at `.github/workflows/ci.yml`, the `workflows.instructions.md` matches via `'**/.github/workflows/*.yml'`. Any general YAML instructions would also match. The developer gets both sets of guidelines without having to know which instruction files exist.

This layering model means instruction authors must write for composition. Each instruction file should be self-contained and non-contradictory with other instructions that might match the same files. The Bash instruction covers shell-specific patterns — shebang lines, `set -euo pipefail`, ShellCheck compliance. The PowerShell instruction covers PowerShell-specific patterns — `$ErrorActionPreference`, Pester test conventions. They never conflict because their `applyTo` patterns target disjoint file extensions.

When instructions do target overlapping paths, the content must be complementary. The Docusaurus instruction's `applyTo: 'docs/**'` could match alongside a Markdown instruction. The Docusaurus instruction focuses on site-specific conventions — frontmatter fields like `sidebar_position`, admonition syntax, Mermaid diagram support — while a general Markdown instruction would cover formatting basics. Together, they provide complete guidance for documentation contributors.

#### Content: Frontmatter Schema and CI Validation

Every instruction file's frontmatter must conform to a defined schema. The required fields are `description` (a string summarizing the instruction's purpose) and `applyTo` (a glob pattern or comma-separated pattern list). The `description` field follows a consistent convention across the repository — many end with "Brought to you by microsoft/hve-core" to identify provenance.

CI pipelines validate this schema on every pull request. Files missing required frontmatter fields, using invalid glob syntax in `applyTo`, or containing malformed YAML are flagged before merge. This prevents broken instructions from entering the repository and silently failing to match any files.

The validation extends beyond frontmatter. Instruction files are Markdown, so they also pass through markdownlint checks configured in `.markdownlint-cli2.jsonc` and `.markdownlint.json` at the repository root. These checks enforce consistent heading levels, list formatting, line length, and other structural requirements. The combination of frontmatter schema validation and Markdown linting ensures that every instruction file is both syntactically valid and structurally consistent.

The Bash instruction file demonstrates the complete pattern. Its frontmatter declares `applyTo: '**/*.sh'` and `description: 'Instructions for bash script implementation - Brought to you by microsoft/hve-core'`. Its body covers script structure, copyright headers, formatting, variables, functions, error handling, ShellCheck compliance, and Azure CLI patterns — each section with code examples wrapped in fenced blocks. CI validates the frontmatter schema, markdownlint validates the Markdown structure, and the `applyTo` pattern ensures it reaches every Bash script in the repository.

#### Outro

Instructions are the silent workhorse of HVE Core. Their auto-apply mechanism eliminates the manual step of choosing guidelines — the right standards activate based on what you edit. The 351 instruction files cover languages, platforms, workflows, and domain-specific processes. They compose additively, so opening a single file can pull in multiple layers of guidance. CI validates every instruction's frontmatter and structure before merge. In Module 7, we move to prompts — the artifact type that surfaces as slash commands for on-demand task execution.

### Key Talking Points
- Instructions use `.instructions.md` with `applyTo` glob patterns for automatic activation — `'**/*.sh'`, `'**/*.cs'`, `'**/.github/workflows/*.yml'`, `'docs/**'`
- The repository contains 351 instruction files across coding standards (Bash, C#, PowerShell, Rust, Python, Bicep, Terraform), platform integrations (ADO, GitHub, Jira), design thinking, security, and RAI planning
- Multiple instructions compose additively when their `applyTo` patterns match the same file — language base + test conventions + domain guidelines layer without conflict
- CI validates frontmatter schema (required `description` and `applyTo` fields) and Markdown structure via markdownlint on every pull request
