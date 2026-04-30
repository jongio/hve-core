# Module 13: Extension Packaging and CI/CD

## Episode 13 | Semester 4: Operations and Mastery

### Learning Objectives

- Describe the two-step Prepare and Package pipeline that produces distributable VSIX extensions
- Explain how collection-scoped builds and maturity filtering control what ships in each extension variant
- Categorize the 49 CI/CD workflows by function: validation, security, testing, release, and maintenance
- Trace the stable release pipeline from release-please through SBOM generation, attestation, and marketplace publish

### Narration Script

#### Intro

HVE Core's artifacts live as Markdown files in a repository. Shipping them to users requires transforming those files into VS Code extension packages — VSIX files — that the marketplace can distribute. This module covers the packaging pipeline that performs that transformation and the CI/CD infrastructure that automates validation, security scanning, testing, and release across 49 GitHub Actions workflow files.

#### Objectives

Module 13 covers four areas. First, the two-step Prepare and Package pipeline — how `Prepare-Extension.ps1` discovers and filters artifacts, and how `Package-Extension.ps1` invokes `vsce` to produce VSIX files. Second, collection-scoped builds and maturity filtering — how the same pipeline produces different extension variants for different audiences. Third, a categorization of all 49 workflow files by their operational function. Fourth, the stable release pipeline — the full chain from `release-please` through SBOM generation, cryptographic attestation, GitHub Release upload, and VS Code Marketplace publishing.

#### Content: The Prepare and Package Pipeline

Extension builds follow a two-step pipeline. The first step, Prepare, runs via `npm run extension:prepare` which invokes `scripts/extension/Prepare-Extension.ps1`. The second step, Package, runs via `npm run extension:package` which invokes `scripts/extension/Package-Extension.ps1`. Each step has a pre-release variant: `extension:prepare:prerelease` passes `-Channel PreRelease` to the Prepare script, and `extension:package:prerelease` passes `-PreRelease` to the Package script.

The Prepare script performs artifact discovery. It auto-discovers chat agents, prompts, and instruction files from the repository's `.github/` directories. It reads each artifact's frontmatter to determine maturity level, then filters based on the channel parameter. The `Stable` channel — the default — includes only artifacts with `stable` maturity. The `PreRelease` channel includes `stable`, `preview`, and `experimental` maturity levels. After filtering, the script updates the extension's `package.json` with the discovered components — registering agents, prompts, and instructions so VS Code recognizes them when the extension is installed.

The Prepare script also accepts a `-Collection` parameter. When a collection manifest path is provided, only artifacts listed in that collection are included. This enables collection-scoped builds — producing extension variants that contain different subsets of the full artifact library. The script imports two helper modules: `CIHelpers.psm1` from `scripts/lib/Modules/` for CI utility functions and `CollectionHelpers.psm1` from `scripts/collections/Modules/` for collection manifest parsing. It supports a `-DryRun` flag that shows what would be done without making changes.

The Package script takes the prepared extension directory and produces a `.vsix` file. It checks for `vsce` availability — first looking for a direct `vsce` command, then falling back to `npx @vscode/vsce`. It validates the extension manifest for required fields and correct format. It supports version override via the `-Version` parameter, dev patch numbers for pre-release identification (creating versions like `1.0.0-dev.123`), and changelog inclusion via `-ChangelogPath`. The `-PreRelease` flag invokes `vsce` with `--pre-release`, marking the package for the VS Code Marketplace pre-release track. Like the Prepare script, it accepts `-Collection` and `-DryRun` parameters.

#### Content: Collection-Scoped and Full Builds

The `collections/` directory contains paired files for each collection — a `.collection.yml` manifest and a `.collection.md` description. Current collections include `hve-core` (the primary collection), `hve-core-all` (comprehensive), `coding-standards`, `security`, `github`, `gitlab`, `ado` (Azure DevOps), `jira`, `project-planning`, `design-thinking`, `data-science`, `experimental`, and `installer`. Each collection defines which agents, instructions, prompts, and skills are included.

In CI, the `extension-package.yml` reusable workflow orchestrates collection discovery and matrix packaging. Its first job, `discover-collections`, runs `scripts/extension/Find-CollectionManifests.ps1` to enumerate available collections and reads the version from `package.json`. It outputs a matrix of collections. Subsequent packaging jobs run in parallel across this matrix, producing one VSIX per collection. The workflow accepts inputs for version, dev-patch-number, changelog usage, and channel. Its outputs include the resolved version and the collections matrix — a JSON structure consumed by downstream release jobs.

This architecture means the same pipeline handles both full and scoped builds. A team that only needs coding standards artifacts gets an extension containing just those files. A team running experimental AI workflows gets the pre-release channel with all maturity levels. The filtering happens at prepare time, not install time — each VSIX contains exactly the artifacts it should contain, with no runtime overhead.

HVE Core uses an even/odd minor version convention to distinguish release channels. Stable releases use even minor versions (3.2.x, 3.4.x). Pre-release versions use odd minor versions (3.3.x, 3.5.x). The `release-stable.yml` workflow validates this convention — it rejects any release with an odd minor version. The `release-prerelease.yml` workflow enforces the inverse, rejecting pre-release versions with even minors. This convention makes it immediately clear from a version number which channel a build belongs to.

#### Content: CI/CD Workflow Categories

The `.github/workflows/` directory contains 49 workflow files. They organize into five functional categories.

**Validation workflows** enforce code quality on every pull request and push. `pr-validation.yml` is the top-level orchestrator for pull requests — it dispatches to reusable workflows for spell checking (`spell-check.yml`), Markdown linting (`markdown-lint.yml`), table formatting (`table-format.yml`), PowerShell analysis (`ps-script-analyzer.yml`), YAML linting (`yaml-lint.yml`), copyright headers (`copyright-headers.yml`), frontmatter validation (`frontmatter-validation.yml`), link checking (`link-lang-check.yml`, `markdown-link-check.yml`), skill validation (`skill-validation.yml`), and AI artifact validation (`ai-artifact-validation.yml`). Python projects are discovered dynamically and linted and tested in matrix jobs via `python-lint.yml` and `pytest-tests.yml`. `docusaurus-tests.yml` validates the documentation site build.

**Security workflows** protect the supply chain. `gitleaks-scan.yml` detects secrets in committed code. `codeql-analysis.yml` performs static analysis for vulnerabilities. `dependency-review.yml` scans pull request dependency changes. `dependency-pinning-scan.yml` verifies that all dependencies use exact version pins. `action-version-consistency-scan.yml` checks that GitHub Actions SHA pins are consistent across workflows. `workflow-permissions-scan.yml` audits workflow permission declarations. `pip-audit.yml` scans Python dependencies for known vulnerabilities. `scorecard.yml` runs the OpenSSF Scorecard assessment. `security-scan.yml` provides additional security scanning. `sha-staleness-check.yml` identifies action SHA pins that reference outdated releases.

**Testing workflows** run the test suites. `pester-tests.yml` executes PowerShell Pester tests with optional code coverage. `pytest-tests.yml` runs Python test suites. `fuzz-tests.yml` performs fuzz testing on Python projects. `docusaurus-tests.yml` validates the documentation site.

**Release workflows** manage the full publication lifecycle. `release-stable.yml` is the top-level stable release orchestrator — it runs all validation and security checks, then invokes `release-please` to manage versioning. When a release is created, it triggers extension packaging via `extension-package.yml`, plugin packaging via `plugin-package.yml`, SBOM generation, attestation, and GitHub Release upload. `release-marketplace-stable.yml` publishes stable VSIX packages to the VS Code Marketplace. `release-prerelease.yml` and `release-prerelease-pr.yml` manage the pre-release channel. `release-marketplace-prerelease.yml` publishes pre-release extensions. `extension-marketplace-publish.yml` is the reusable workflow that handles marketplace authentication and upload. `plugin-validation.yml` validates plugin packaging.

**Maintenance workflows** handle scheduled operations. `weekly-validation.yml` runs comprehensive validation every Monday at 09:00 UTC, including Pester coverage baselines and Python test suites. `weekly-security-maintenance.yml` runs every Sunday at 02:00 UTC, executing dependency pinning validation, SHA staleness checks, CodeQL analysis, and Gitleaks scans. `create-stale-docs-issues.yml` and `msdate-freshness-check.yml` manage documentation staleness. `label-sync.yml` synchronizes repository labels. `deploy-docs.yml` handles documentation site deployment. `devcontainer-change-log.yml` tracks DevContainer configuration changes. `dependency-pr-review.lock.yml` automates Dependabot PR review. `doc-update-check.lock.yml` and `doc-update-check.md` manage documentation update tracking.

The orchestrator pattern is central to this design. `pr-validation.yml` and `release-stable.yml` do not contain validation logic themselves — they dispatch to reusable workflow files using `uses: ./.github/workflows/<name>.yml`. Each reusable workflow accepts standard inputs like `soft-fail` (boolean controlling whether failures are advisory or blocking) and `changed-files-only` (boolean limiting scope to PR-modified files). This means the same spell-check workflow runs identically whether called from PR validation, release validation, or weekly validation — the only difference is the input parameters.

#### Content: The Stable Release Pipeline

The stable release pipeline in `release-stable.yml` is the most complex workflow. On every push to `main`, it runs validation checks in parallel: spell check, Markdown lint, table format, dependency pinning scan, action version consistency scan, Gitleaks secret scan, Pester tests, Docusaurus tests, Python lint, and Python tests. Python jobs use dynamic matrix discovery — a preliminary job finds all directories containing `pyproject.toml` and generates a matrix of project paths.

After all checks pass, the `release-please` job runs. It uses `googleapis/release-please-action` with the project's `release-please-config.json` and `.release-please-manifest.json`. The config specifies `node` release type, `draft: true` for releases, and changelog sections mapped to Conventional Commit types: `feat` maps to Features, `fix` to Bug Fixes, `docs` to Documentation, `refactor` to Refactoring, and `chore` to Maintenance. The config also lists extra files for version synchronization — `extension/templates/package.template.json`, `.github/plugin/marketplace.json`, and plugin-level `plugin.json` files via glob patterns.

When `release-please` creates a release, the pipeline fans out. Three jobs run in parallel: `extension-package-release` packages VSIX files for each collection, `plugin-package-release` packages plugin ZIP files, and `generate-dependency-sbom` creates a Software Bill of Materials using Anchore's `sbom-action` with Syft, configured via `.syft.yaml` to include dev dependencies and search remote licenses. The dependency SBOM uses SPDX 2.3 JSON format and is uploaded both as a workflow artifact and directly to the GitHub Release.

The `attest-and-upload` job runs after packaging and SBOM generation complete. For each collection in the packaging matrix, it downloads the VSIX artifact and the dependency SBOM. It generates a per-VSIX SBOM. It then runs three attestation steps: `actions/attest-build-provenance` creates a Sigstore-backed provenance attestation for the VSIX. `actions/attest` attests the per-VSIX SBOM. A second `actions/attest` call attests the dependency SBOM. The provenance bundle is extracted into two companion files — a `.sigstore.json` bundle and an `.intoto.jsonl` DSSE envelope. All artifacts — the VSIX, the per-VSIX SBOM, the Sigstore bundle, and the in-toto envelope — are uploaded to the GitHub Release. The same attestation flow runs in parallel for plugin packages via the `upload-plugin-packages` job.

After the GitHub Release is created and populated, `release-marketplace-stable.yml` fires on the `release: published` event. It resolves the version, packages the extension for the marketplace channel, and publishes via `extension-marketplace-publish.yml`, which authenticates through Azure OIDC (using `azure/login` with client ID, tenant ID, and subscription ID from secrets) and invokes `vsce` to publish. The marketplace publish workflow runs per-collection using the same matrix pattern.

Additional post-release jobs in the stable pipeline include `close-milestone`, which automatically closes the GitHub milestone matching the released version, and `reset-prerelease`, which force-pushes the `prerelease/next` branch to the new `main` state, bumps version files to the next odd minor using `scripts/release/Update-VersionFiles.ps1`, and creates or updates the standing pre-release PR.

#### Outro

Three takeaways from this module. First, the Prepare and Package pipeline separates artifact discovery and filtering from VSIX production — `Prepare-Extension.ps1` handles collection-scoped filtering and maturity gating, while `Package-Extension.ps1` handles `vsce` invocation and version management. Second, the 49 workflows organize into validation, security, testing, release, and maintenance categories, using an orchestrator pattern where top-level dispatchers like `pr-validation.yml` and `release-stable.yml` call reusable workflow files with standardized inputs. Third, the stable release pipeline chains release-please version management through parallel packaging, SBOM generation with Anchore Syft in SPDX 2.3 format, Sigstore attestation for both build provenance and SBOMs, GitHub Release upload, and VS Code Marketplace publishing — producing cryptographically verifiable artifacts that users can validate with `gh attestation verify`.

Module 14 covers how organizations adopt HVE Core's collection model for diverse teams, the governance structure that sustains the project, and the contribution workflow for new participants.

### Key Talking Points

- Two-step pipeline: `Prepare-Extension.ps1` discovers and filters artifacts, `Package-Extension.ps1` invokes `vsce` to produce VSIX files
- Prepare accepts `-Channel` (Stable/PreRelease) for maturity filtering and `-Collection` for collection-scoped builds
- Stable channel ships only `stable` maturity artifacts; PreRelease includes `stable`, `preview`, and `experimental`
- Even/odd minor version convention: even minors (3.2.x) for stable, odd minors (3.3.x) for pre-release
- `extension-package.yml` discovers collections dynamically and runs matrix packaging jobs in parallel
- 49 workflow files in `.github/workflows/` organized into validation, security, testing, release, and maintenance categories
- Orchestrator pattern: `pr-validation.yml` and `release-stable.yml` dispatch to reusable workflows with standard inputs (`soft-fail`, `changed-files-only`)
- `release-stable.yml` chains: validation → release-please → parallel packaging → SBOM generation → attestation → GitHub Release → marketplace publish
- SBOM generation uses Anchore `sbom-action` with Syft, producing SPDX 2.3 JSON format, configured via `.syft.yaml`
- Attestation produces three companion files per artifact: `.spdx.json` (SBOM), `.sigstore.json` (Sigstore bundle), `.intoto.jsonl` (DSSE envelope)
- Marketplace publishing authenticates via Azure OIDC and runs per-collection
- Post-release automation closes the milestone and resets the `prerelease/next` branch with bumped version files
- `release-please-config.json` maps Conventional Commit types to changelog sections and synchronizes versions across template files and plugin manifests
