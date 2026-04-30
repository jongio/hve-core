# Module 02: Installation and First Workflow

## Episode 02 | Semester 1: Foundations

### Learning Objectives

- Compare the three installation paths and select the right one for a given scenario
- Install HVE Core from the VS Code Marketplace in under 30 seconds
- Verify that agents, instructions, and prompts are active in your workspace
- Run a first agent conversation using the memory agent to confirm end-to-end functionality

### Narration Script

#### Intro

HVE Core delivers its artifacts through VS Code extensions, selective installers, and direct repository clones. Each path targets a different use case. This module walks through all three, then runs a first agent interaction to confirm everything is working.

#### Objectives

Module 2 covers four things. First, the three installation paths and the decision matrix for choosing between them. Second, a step-by-step marketplace install. Third, a verification checklist to confirm artifacts loaded. Fourth, running a first agent conversation to prove end-to-end functionality.

#### Content: Three Installation Paths

The installation guide at `docs/getting-started/install.md` defines three paths: Marketplace Install, Selective Install, and Developer Setup.

**Marketplace Install** is the recommended path for most users. It delivers the HVE Core extension (`ise-hve-essentials.hve-core`) from the VS Code Marketplace with zero configuration. The extension installs the `hve-core` flagship collection — 17 agents, 15 prompts, 7 instructions, and 1 skill covering the RPI workflow plus Git prompts. Updates arrive automatically through VS Code. For teams that want every artifact across all domains, the **HVE Core All** extension (`ise-hve-essentials.hve-core-all`) bundles 51 agents, 63 prompts, 102 instructions, and 12 skills.

**Selective Install** uses the HVE Installer extension (`ise-hve-essentials.hve-installer`). After installing the Installer extension, open Copilot Chat and ask any agent: "help me customize hve-core installation." The installer skill reads collection manifests from `collections/*.collection.yml` and copies only the agents from your selected bundles to `.github/agents/`. This path suits teams that need specific domains — say, only `coding-standards` and `ado` — without the full library. Agent bundle selection currently applies to agents only; support for prompts, instructions, and skills is planned for a future release.

**Developer Setup** is for contributors who need to modify HVE Core source code. Fork the repository, clone it with `git clone`, run `npm ci` to install the development dependencies declared in `package.json`, and open the workspace in VS Code. The repository includes a devcontainer configuration for containerized development. This path gives you access to the full validation pipeline — markdown linting (`npm run lint:md`), frontmatter validation (`npm run lint:frontmatter`), collection metadata checks (`npm run lint:collections-metadata`), AI artifact validation (`npm run lint:ai-artifacts`), and PowerShell-based Pester tests (`npm run test:ps`). A comprehensive `npm run lint:all` script chains every linter in sequence.

The install documentation includes a decision matrix mapping environment type, team size, and update preference to a recommended method. For example: any environment with auto-updates maps to the VS Code Extension; local development without containers for a solo developer maps to a Peer Directory Clone; teams wanting version-pinned updates map to Git Submodule; CLI-preferred workflows map to CLI Plugins. Additional methods are documented for multi-root workspaces, mounted directories, and GitHub Codespaces-only environments. The detailed comparison lives at `docs/getting-started/methods/comparison.md`. The simplest rule: start with the VS Code Extension. You can switch to any other method later without losing configuration.

#### Content: Step-by-Step Marketplace Install

The marketplace install takes four steps. Open VS Code and navigate to the Extensions view with `Ctrl+Shift+X`. Search for "HVE Core" in the search bar. Click Install on the extension published by `ise-hve-essentials`. Reload VS Code when prompted.

Alternatively, visit `marketplace.visualstudio.com/items?itemName=ise-hve-essentials.hve-core` directly and click Install. VS Code opens and handles the rest.

The extension works across local VS Code, devcontainers, and GitHub Codespaces without additional configuration. Once installed, agents, instructions, and prompts activate automatically. There is no setup wizard, no configuration file to edit, and no additional dependencies to install.

One post-installation step applies to all methods: add `.copilot-tracking/` to your project's `.gitignore`. HVE Core creates this directory in your project to store ephemeral workflow artifacts — research documents, implementation plans, PR review notes, and work item planning files. These files help agents maintain context across sessions but should not be committed to your repository.

Some HVE Core agents optionally integrate with MCP (Model Context Protocol) servers for Azure DevOps, GitHub, or documentation services. The MCP configuration guide at `docs/getting-started/mcp-configuration.md` covers setup for those integrations. Agents work without MCP configuration — it is an enhancement, not a requirement.

#### Content: Verification Checklist

After installation, verify that HVE Core is active with three checks.

First, open Copilot Chat in VS Code using `Ctrl+Alt+I`. Type `@` to see the agent picker dropdown. HVE Core agents appear in the list — look for `task-researcher`, `task-planner`, `task-implementor`, and `memory`. If you installed HVE Core All, you see up to 51 agents across all domains. If you installed the flagship `hve-core` collection, you see the 17 agents in the core RPI workflow including `rpi-agent`, `task-researcher`, `task-planner`, `task-implementor`, `task-reviewer`, `memory`, `doc-ops`, `prompt-builder`, and `pr-review`, plus their subagents.

Second, verify prompts are available. Type `/` in Copilot Chat to see prompt shortcuts. The flagship collection includes `/task-research`, `/task-plan`, `/task-implement`, `/task-review`, `/git-commit`, `/git-merge`, `/pull-request`, and others. These prompt files live under `.github/prompts/hve-core/` and route to their corresponding agents automatically.

Third, verify instructions are active by opening any file that matches an instruction's `applyTo:` glob pattern. For example, open a Markdown file. The `markdown.instructions.md` file from the `hve-core` collection has `applyTo:` targeting `**/*.md` files and applies writing style and formatting conventions automatically. You do not see a visible indicator — instructions work silently by shaping Copilot's responses for matching file types.

If agents do not appear in the picker, check the HVE Core troubleshooting page at `docs/getting-started/troubleshooting.md`. Common causes include the extension not being installed in the correct VS Code instance (local versus remote) or a reload being required.

#### Content: First Agent Conversation

The fastest way to confirm end-to-end functionality is to talk to the `memory` agent. The getting started documentation at `docs/getting-started/first-interaction.md` walks through this exact flow.

Open Copilot Chat with `Ctrl+Alt+I`. Select the **memory** agent from the agent picker dropdown. Type: "Remember that I am a software engineer and I'm learning HVE Core for the first time." The agent responds and creates a file in your workspace under the `memories/` directory. Open that file — you see your role stored as a note that persists across sessions.

Now verify cross-agent context sharing. Open a new Copilot Chat thread and type: "Explain what this repository does and how it helps someone in my role." The response references your role as a software engineer without you mentioning it again. Copilot read the memory file, found your stored context, and tailored the explanation.

This single interaction proves four things: the extension is installed, agents respond to natural language, the memory system creates real files in your workspace, and other agents use those files to personalize their responses.

The getting started journey continues with three more steps documented at `docs/getting-started/`. The next step, "Your First Workflow" at `docs/getting-started/first-workflow.md`, walks through running a complete task using an RPI agent. After that, "Your First Research" at `docs/getting-started/first-research.md` guides you through the full four-phase RPI cycle. From here, you are ready to use the RPI workflow agents — `task-researcher`, `task-planner`, `task-implementor`, and `task-reviewer` — for real engineering tasks.

#### Outro

HVE Core installs from the VS Code Marketplace in under 30 seconds. The flagship extension delivers the core RPI workflow; HVE Core All delivers every artifact across all 13 collections. Verification takes three checks: agents in the picker, prompts in the slash-command list, and a memory agent conversation that creates a persistent file. Module 3 covers the RPI methodology — the four-phase workflow that separates research from implementation and assigns each phase to a specialized, constrained agent.

### Key Talking Points

- Three install paths: Marketplace Extension (recommended), HVE Installer (selective), Developer Clone (contributors)
- Marketplace install is four steps: Extensions view, search, install, reload
- Verification: agents in `@` picker, prompts in `/` list, memory agent file creation
- Add `.copilot-tracking/` to `.gitignore` after any installation method
