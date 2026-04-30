# Module 08: Skills — Self-Contained Packages
## Episode 08 | Semester 2: The Four Artifact Types

### Learning Objectives
- Describe skill anatomy including the SKILL.md entry point, scripts/, references/, and tests/ directories
- Explain Python skill requirements including pyproject.toml, ruff linting, and pytest testing
- Identify cross-platform scripting patterns with matched Bash and PowerShell scripts validated by CI
- List the actual skills shipped in HVE Core and their domain coverage

### Narration Script

#### Intro

Skills are the most structurally complex artifact type in HVE Core. Where agents are single Markdown files and instructions are single Markdown files with glob patterns, skills are entire directory trees. Each skill bundles a SKILL.md entry point with optional scripts, reference documents, tests, and configuration files. The HVE Core repository ships 18 skills under `.github/skills/`, spanning security frameworks, coding standards, platform integrations, and tooling automation.

#### Objectives

Module 8 covers four areas. First, the anatomy of a skill directory — SKILL.md as the entry point and the conventional subdirectories. Second, Python skill requirements including pyproject.toml, ruff, and pytest. Third, cross-platform scripting with matched Bash and PowerShell scripts. Fourth, a catalog of the actual skills in the repository and what they cover.

#### Content: Skill Anatomy

Every skill lives in its own directory and begins with a `SKILL.md` file. This Markdown file serves as the entry point — the file that agents read to understand what the skill provides and how to use it. SKILL.md has YAML frontmatter with fields including `name`, `description`, `license`, `user-invocable`, `compatibility`, and a `metadata` block for authors, spec version, and last updated date.

The OWASP Top 10 skill at `.github/skills/security/owasp-top-10/SKILL.md` demonstrates the pattern. Its frontmatter declares `name: owasp-top-10`, `description: OWASP Top 10 for Web Applications (2025) vulnerability knowledge base`, `license: CC-BY-SA-4.0`, and `user-invocable: false`. The metadata block includes `authors: "OWASP Web Application Security Project"`, `spec_version: "1.0"`, `framework_revision: "1.0.0"`, and `last_updated: "2026-02-13"`. Two additional metadata fields — `skill_based_on` and `content_based_on` — link to the Agnostic Prompt Standard specification and the OWASP source material.

The SKILL.md body contains the skill's documentation: an overview explaining what the skill encodes, a list of normative references pointing to files in the `references/` directory, a skill layout section describing the directory structure, and attribution for third-party content.

Below SKILL.md, skills use conventional subdirectories. The `references/` directory holds knowledge base documents that agents read for domain expertise. The OWASP Top 10 skill has 11 reference files: a vulnerability index at `00-vulnerability-index.md` and one document per vulnerability from `01-broken-access-control.md` through `10-mishandling-exceptional-conditions.md`. These are structured, machine-readable documents that an agent queries during vulnerability assessment.

The `scripts/` directory contains executable automation. The PowerPoint skill at `.github/skills/experimental/powerpoint/` has 15 Python scripts including `build_deck.py`, `extract_content.py`, `validate_slides.py`, `export_slides.py`, `render_pdf_images.py`, and supporting modules like `pptx_charts.py`, `pptx_colors.py`, `pptx_fills.py`, `pptx_fonts.py`, `pptx_shapes.py`, `pptx_tables.py`, `pptx_text.py`, and `pptx_utils.py`. The directory also contains a PowerShell orchestration script `Invoke-PptxPipeline.ps1` and its Bash equivalent `invoke-pptx-pipeline.sh`.

The `tests/` directory holds validation tests. The PowerPoint skill has 24 test files including unit tests (`test_pptx_colors.py`, `test_pptx_shapes.py`, `test_pptx_tables.py`), integration tests (`test_extract_content_integration.py`), fuzz tests (`test_fuzz_build_deck.py`, `test_fuzz_pptx_colors.py`, `test_fuzz_pptx_tables.py`, `test_fuzz_validate_slides.py`), and a Pester test for the PowerShell orchestrator (`Invoke-PptxPipeline.Tests.ps1`). The test directory also includes supporting infrastructure: `conftest.py`, `fuzz_harness.py`, `strategies.py`, and `corpus/` and `fixtures/` directories.

Not every skill uses all subdirectories. Reference-only skills like the OWASP Top 10 have just `SKILL.md` and `references/`. Script-heavy skills like the PowerPoint builder have `scripts/` and `tests/` but could also include `references/`. The PR Reference skill at `.github/skills/shared/pr-reference/` has `scripts/`, `references/`, and `tests/`. The directory structure adapts to what the skill needs.

#### Content: Python Skill Requirements

Skills that include Python scripts follow a specific toolchain. The `pyproject.toml` file at the skill root declares dependencies, build configuration, and tool settings. The PowerPoint skill and the GitLab skill both include `pyproject.toml` and a `uv.lock` file for reproducible dependency resolution.

The PowerPoint skill's SKILL.md declares its compatibility requirements: "Requires uv, Python 3.11+, PowerShell 7+, and LibreOffice." The `uv` tool manages virtual environments and dependency installation. The orchestration scripts handle environment setup automatically — the `Invoke-PptxPipeline.ps1` PowerShell script runs `uv sync` to create the virtual environment and install dependencies before executing any Python scripts.

Code quality is enforced through ruff — a fast Python linter and formatter. Skills configure ruff in their `pyproject.toml` with rules for import ordering, code style, and common error patterns. CI pipelines run ruff checks on every pull request that touches skill Python code.

Testing uses pytest as the standard test runner. Test files follow the `test_*.py` naming convention and live in the `tests/` directory. The PowerPoint skill demonstrates a comprehensive test strategy: unit tests for individual modules, integration tests for end-to-end workflows, fuzz tests using Hypothesis-style strategies for property-based testing, and PowerShell Pester tests for the orchestrator script.

The Python foundational skill at `.github/skills/coding-standards/python-foundational/` takes a different approach — it has no scripts or tests because it is a reference-only skill. Its SKILL.md contains a checklist of Python best practices that the code review agent loads when reviewing Python diffs. The `references/` directory has two files: `design-principles.md` and `code-style-patterns.md`. This skill functions as a portable knowledge base rather than an executable tool.

#### Content: Cross-Platform Scripting

Skills that include scripts follow a cross-platform pattern: every Bash script has a corresponding PowerShell script, and CI validates both. The PR Reference skill at `.github/skills/shared/pr-reference/scripts/` demonstrates this clearly. It contains six script files organized in pairs: `generate.sh` and `generate.ps1`, `list-changed-files.sh` and `list-changed-files.ps1`, `read-diff.sh` and `read-diff.ps1`. A shared PowerShell module `shared.psm1` provides common functions used by the PowerShell scripts.

The PowerPoint skill follows the same pattern. The `scripts/` directory contains `invoke-pptx-pipeline.sh` (Bash) and `Invoke-PptxPipeline.ps1` (PowerShell) as paired orchestration scripts. Both scripts perform the same operations — environment setup, dependency installation, and pipeline execution — using platform-native commands.

This dual-script requirement exists because HVE Core runs on macOS, Linux, and Windows. Agents invoke skill scripts through the terminal, and the operating system determines which script runs. The Bash version handles macOS and Linux; the PowerShell version handles Windows. Agents do not need to detect the platform — they reference the script by function, and the runtime resolves the correct version.

CI validates both script variants on every pull request. Bash scripts must pass ShellCheck analysis — the Bash instruction file specifies `set -euo pipefail` strict mode, `[[ ]]` test syntax, quoted variable expansions, and the main function pattern. PowerShell scripts follow the conventions in the PowerShell instruction file. Pester tests like `Invoke-PptxPipeline.Tests.ps1` validate PowerShell script behavior. This ensures neither platform falls behind as skills evolve.

#### Content: The Skill Catalog

The 18 skills in HVE Core organize into five subdirectories under `.github/skills/`.

The `security/` directory is the largest, containing nine skills focused on OWASP frameworks and secure development practices. The `owasp-top-10/` skill encodes the OWASP Top 10 for Web Applications (2025). The `owasp-llm/` skill covers OWASP vulnerabilities specific to Large Language Model applications. The `owasp-agentic/` skill addresses security risks in agentic AI systems. The `owasp-mcp/` skill covers Model Context Protocol security. The `owasp-infrastructure/` skill addresses infrastructure security. The `owasp-cicd/` skill covers CI/CD pipeline security. The `owasp-docker/` skill addresses container security. The `secure-by-design/` skill provides secure-by-design development patterns. The `security-reviewer-formats/` skill defines output formats for the security review agent.

The Security Reviewer agent loads these skills dynamically based on codebase profiling. When it scans a web application, it loads `owasp-top-10`. When it scans an LLM-powered application, it loads `owasp-llm`. When it finds Docker files, it loads `owasp-docker`. Each skill's SKILL.md contains the structured knowledge base the agent needs — vulnerability descriptions, detection heuristics, remediation guidance, and severity rubrics.

The `coding-standards/` directory contains the `python-foundational/` skill — the foundational Python best practices checklist loaded during code reviews. Its SKILL.md explains why this content is a skill rather than an instruction file: "skills are distributed through the CLI plugin and VS Code extension without requiring consumers to copy files into their repo; new language skills can be added without modifying the review agent itself; and skills are loaded on demand, keeping the context window small when the diff contains no Python."

The `experimental/` directory contains three skills. The `powerpoint/` skill is the most complex in the repository — a full PowerPoint generation system with 15 Python scripts, a pyproject.toml, paired Bash and PowerShell orchestrators, 24 test files, and YAML template definitions for content and styling. The `customer-card-render/` skill renders customer card visualizations. The `video-to-gif/` skill converts video files to GIF format. The `vscode-playwright/` skill provides VS Code Playwright browser automation.

The `gitlab/` directory contains the `gitlab/` skill for GitLab platform integration, including Python scripts, tests, pyproject.toml, and a uv.lock file.

The `installer/` directory contains the `hve-core-installer/` skill — a decision-driven installer with environment detection, six clone-based installation methods, extension quick-install, validation, MCP configuration, and agent customization workflows. Its SKILL.md includes examples, a scripts directory, and test files.

The `jira/` directory contains the `jira/` skill for Jira integration.

The `shared/` directory contains the `pr-reference/` skill used by multiple agents for generating PR reference documents from git diffs. It provides paired Bash and PowerShell scripts and reference documentation.

#### Outro

Skills are the most self-contained artifact type in HVE Core. Each skill bundles everything it needs — knowledge base documents in references, executable automation in scripts, validation in tests, and dependency management in pyproject.toml. The 18 skills span security frameworks, coding standards, platform integrations, and specialized tooling. Cross-platform scripts ensure skills work on macOS, Linux, and Windows. CI validates both script variants and runs tests on every pull request. Together, agents, instructions, prompts, and skills form the complete artifact system. The next modules cover how these artifacts are packaged into collections and validated through CI.

### Key Talking Points
- Skills are directory trees with a SKILL.md entry point, optional `references/`, `scripts/`, `tests/`, `pyproject.toml`, and `uv.lock` — the PowerPoint skill has 15 scripts, 24 test files, and paired Bash/PowerShell orchestrators
- Python skills use pyproject.toml for dependencies, ruff for linting, pytest for testing, and uv for virtual environment management
- Cross-platform scripting requires matched Bash and PowerShell scripts — the PR Reference skill has three paired scripts (`generate.sh`/`.ps1`, `list-changed-files.sh`/`.ps1`, `read-diff.sh`/`.ps1`) validated by CI
- The 18 skills span security (9 OWASP/SBD skills), coding standards (Python foundational), experimental (PowerPoint, video-to-gif, customer-card-render, vscode-playwright), platform (GitLab, Jira), shared (pr-reference), and installer (hve-core-installer)
