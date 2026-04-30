import { ModuleDiagrams } from "../types";

export const moduleDiagrams: ModuleDiagrams = {
  // Module 1: Architecture showing artifacts → collections → extensions → Copilot
  1: {
    "architecture-overview": {
      type: "architecture",
      title: "HVE Core Architecture",
      props: {
        nodes: [
          { id: "agents", label: "Agents (57)", x: 100, y: 100 },
          { id: "instructions", label: "Instructions (107)", x: 100, y: 280 },
          { id: "prompts", label: "Prompts (68)", x: 100, y: 460 },
          { id: "skills", label: "Skills (18)", x: 100, y: 640 },
          { id: "collections", label: "13 Collections", x: 520, y: 370 },
          { id: "extensions", label: "VS Code Extensions", x: 940, y: 370 },
          { id: "copilot", label: "GitHub Copilot", x: 1360, y: 370 },
        ],
        connections: [
          { from: "agents", to: "collections" },
          { from: "instructions", to: "collections" },
          { from: "prompts", to: "collections" },
          { from: "skills", to: "collections" },
          { from: "collections", to: "extensions" },
          { from: "extensions", to: "copilot" },
        ],
      },
    },
  },

  // Module 2: Installation flow
  2: {
    "installation-flow": {
      type: "flow",
      title: "Installation and First Workflow",
      props: {
        steps: [
          { id: "install", label: "Install Extension", x: 120, y: 400 },
          { id: "activate", label: "Activate in VS Code", x: 440, y: 400 },
          { id: "load", label: "Load Artifacts", x: 760, y: 400 },
          { id: "enhanced", label: "Enhanced Copilot", x: 1080, y: 400 },
          { id: "workflow", label: "Run First Workflow", x: 1400, y: 400 },
        ],
        connections: [
          { from: "install", to: "activate" },
          { from: "activate", to: "load" },
          { from: "load", to: "enhanced" },
          { from: "enhanced", to: "workflow" },
        ],
      },
    },
  },

  // Module 3: Extension point types
  3: {
    "extension-points": {
      type: "block",
      title: "GitHub Copilot Extension Points",
      props: {
        items: [
          {
            id: "agents",
            label: ".agent.md",
            description: "Specialized AI assistants with persona, tools, and subagent orchestration",
            x: 120,
            y: 120,
            width: 380,
            height: 340,
          },
          {
            id: "instructions",
            label: ".instructions.md",
            description: "Auto-applied coding guidelines matched by glob pattern to open files",
            x: 540,
            y: 120,
            width: 380,
            height: 340,
          },
          {
            id: "prompts",
            label: ".prompt.md",
            description: "Reusable task templates with variables and file references",
            x: 960,
            y: 120,
            width: 380,
            height: 340,
          },
          {
            id: "skills",
            label: "SKILL.md",
            description: "Self-contained packages with scripts, references, and tests",
            x: 1380,
            y: 120,
            width: 380,
            height: 340,
          },
        ],
      },
    },
  },

  // Module 4: RPI methodology flow with feedback loops
  4: {
    "rpi-methodology": {
      type: "flow",
      title: "The RPI Methodology",
      props: {
        steps: [
          { id: "task", label: "Task / Work Item", x: 120, y: 400 },
          { id: "research", label: "Research", x: 480, y: 240 },
          { id: "plan", label: "Plan", x: 840, y: 240 },
          { id: "implement", label: "Implement", x: 1200, y: 240 },
          { id: "review", label: "Review", x: 1200, y: 560 },
          { id: "done", label: "Done", x: 1560, y: 400 },
        ],
        connections: [
          { from: "task", to: "research" },
          { from: "research", to: "plan" },
          { from: "plan", to: "implement" },
          { from: "implement", to: "review" },
          { from: "review", to: "research", label: "Needs more info" },
          { from: "review", to: "plan", label: "Revise plan" },
          { from: "review", to: "done", label: "Approved" },
        ],
      },
    },
  },

  // Module 5: Collection pipeline
  5: {
    "collection-pipeline": {
      type: "flow",
      title: "Collection Pipeline",
      props: {
        steps: [
          { id: "manifests", label: "Collection Manifests\n(.collection.yml)", x: 100, y: 400 },
          { id: "validate", label: "Validate Metadata\n(lint:collections)", x: 440, y: 400 },
          { id: "prepare", label: "Prepare Package\n(plugin:generate)", x: 780, y: 400 },
          { id: "package", label: "Package Extension\n(.vsix)", x: 1120, y: 400 },
          { id: "marketplace", label: "Publish to\nMarketplace", x: 1460, y: 400 },
        ],
        connections: [
          { from: "manifests", to: "validate" },
          { from: "validate", to: "prepare" },
          { from: "prepare", to: "package" },
          { from: "package", to: "marketplace" },
        ],
      },
    },
  },

  // Module 6: Agent hierarchy with parent-subagent relationships
  6: {
    "agent-hierarchy": {
      type: "architecture",
      title: "Agent Architecture",
      props: {
        nodes: [
          { id: "user", label: "User", x: 120, y: 370 },
          { id: "manager", label: "Manager Agent", x: 520, y: 370 },
          { id: "researcher", label: "Researcher\nSubagent", x: 940, y: 140 },
          { id: "planner", label: "Planner\nSubagent", x: 940, y: 370 },
          { id: "implementor", label: "Implementor\nSubagent", x: 940, y: 600 },
          { id: "collection", label: "Collection Boundary", x: 720, y: 370, width: 500, height: 620 },
          { id: "skills", label: "Skills", x: 1360, y: 240 },
          { id: "instructions", label: "Instructions", x: 1360, y: 500 },
        ],
        connections: [
          { from: "user", to: "manager" },
          { from: "manager", to: "researcher" },
          { from: "manager", to: "planner" },
          { from: "manager", to: "implementor" },
          { from: "researcher", to: "skills" },
          { from: "implementor", to: "instructions" },
        ],
      },
    },
  },

  // Module 7: Instruction matching flow
  7: {
    "instruction-matching": {
      type: "flow",
      title: "Instruction Matching Pipeline",
      props: {
        steps: [
          { id: "open", label: "File Opened\nin Editor", x: 100, y: 400 },
          { id: "glob", label: "Glob Pattern\nMatching", x: 420, y: 400 },
          { id: "match", label: "Instructions\nMatched", x: 740, y: 400 },
          { id: "apply", label: "Apply to\nCopilot Context", x: 1060, y: 400 },
          { id: "response", label: "Constraint-Aware\nResponse", x: 1380, y: 400 },
        ],
        connections: [
          { from: "open", to: "glob" },
          { from: "glob", to: "match" },
          { from: "match", to: "apply" },
          { from: "apply", to: "response" },
        ],
        annotations: [
          { text: "applyTo: **/*.py", x: 580, y: 280 },
          { text: "applyTo: **/bicep/**", x: 580, y: 520 },
        ],
      },
    },
  },

  // Module 8: Artifact comparison
  8: {
    "artifact-comparison": {
      type: "comparison",
      title: "Artifact Type Comparison",
      props: {
        columns: ["Agents", "Instructions", "Prompts", "Skills"],
        rows: [
          {
            label: "Activation",
            values: ["@agent mention", "Auto on file match", "Slash command", "Referenced by agents"],
          },
          {
            label: "Scope",
            values: ["Conversation", "Per-file context", "Single task", "Reusable package"],
          },
          {
            label: "Statefulness",
            values: ["Multi-turn", "Stateless", "Stateless", "Stateless"],
          },
          {
            label: "Can reference",
            values: ["Subagents, skills", "Other instructions", "Files, instructions", "Scripts, references"],
          },
          {
            label: "Extension",
            values: [".agent.md", ".instructions.md", ".prompt.md", "SKILL.md"],
          },
          {
            label: "Count in HVE",
            values: ["57", "107", "68", "18"],
          },
        ],
      },
    },
  },

  // Module 9: Skill structure block
  9: {
    "skill-structure": {
      type: "block",
      title: "Skill Package Structure",
      props: {
        items: [
          {
            id: "skillmd",
            label: "SKILL.md",
            description: "Domain instructions and orchestration logic",
            x: 540,
            y: 60,
            width: 380,
            height: 140,
          },
          {
            id: "scripts",
            label: "scripts/",
            description: "Python/PowerShell automation scripts",
            x: 120,
            y: 280,
            width: 340,
            height: 140,
          },
          {
            id: "references",
            label: "references/",
            description: "Domain knowledge and standards docs",
            x: 540,
            y: 280,
            width: 340,
            height: 140,
          },
          {
            id: "assets",
            label: "assets/",
            description: "Templates, schemas, configuration files",
            x: 960,
            y: 280,
            width: 340,
            height: 140,
          },
          {
            id: "tests",
            label: "tests/",
            description: "pytest tests and fuzz harness",
            x: 120,
            y: 500,
            width: 340,
            height: 140,
          },
          {
            id: "pyproject",
            label: "pyproject.toml",
            description: "Python config with ruff, pytest, dependencies",
            x: 540,
            y: 500,
            width: 340,
            height: 140,
          },
          {
            id: "fuzz",
            label: "fuzz_harness.py",
            description: "OSSF Scorecard compliance fuzzing",
            x: 960,
            y: 500,
            width: 340,
            height: 140,
          },
        ],
      },
    },
  },

  // Module 10: Extension packaging pipeline
  10: {
    "packaging-pipeline": {
      type: "flow",
      title: "Extension Packaging Pipeline",
      props: {
        steps: [
          { id: "discover", label: "Discover\nCollections", x: 100, y: 400 },
          { id: "validate", label: "Validate\nManifests", x: 380, y: 400 },
          { id: "prepare", label: "Prepare\nArtifacts", x: 660, y: 400 },
          { id: "generate", label: "Generate\nplugin.json", x: 940, y: 400 },
          { id: "package", label: "Package\n.vsix", x: 1220, y: 400 },
          { id: "publish", label: "Publish to\nMarketplace", x: 1500, y: 400 },
        ],
        connections: [
          { from: "discover", to: "validate" },
          { from: "validate", to: "prepare" },
          { from: "prepare", to: "generate" },
          { from: "generate", to: "package" },
          { from: "package", to: "publish" },
        ],
      },
    },
  },

  // Module 11: Validation suite block
  11: {
    "validation-suite": {
      type: "block",
      title: "Validation Infrastructure",
      props: {
        items: [
          {
            id: "markdown",
            label: "Markdown",
            description: "lint:md, lint:md-links, format:tables",
            x: 120,
            y: 100,
            width: 520,
            height: 160,
          },
          {
            id: "schema",
            label: "Schema",
            description: "lint:frontmatter, lint:yaml, lint:collections-metadata",
            x: 720,
            y: 100,
            width: 520,
            height: 160,
          },
          {
            id: "code",
            label: "Code Quality",
            description: "lint:ps, lint:py, validate:copyright",
            x: 120,
            y: 340,
            width: 520,
            height: 160,
          },
          {
            id: "security",
            label: "Security",
            description: "lint:dependency-pinning, lint:permissions, lint:version-consistency",
            x: 720,
            y: 340,
            width: 520,
            height: 160,
          },
          {
            id: "skills",
            label: "Skills",
            description: "validate:skills, spell-check, lint:marketplace",
            x: 120,
            y: 580,
            width: 520,
            height: 160,
          },
          {
            id: "runner",
            label: "npm run lint:all",
            description: "Orchestrates all validators in sequence",
            x: 720,
            y: 580,
            width: 520,
            height: 160,
          },
        ],
      },
    },
  },

  // Module 12: Instruction authoring flow
  12: {
    "instruction-authoring": {
      type: "flow",
      title: "Instruction Authoring Workflow",
      props: {
        steps: [
          { id: "create", label: "Create\n.instructions.md", x: 100, y: 400 },
          { id: "frontmatter", label: "Add Frontmatter\n(description, applyTo)", x: 400, y: 400 },
          { id: "schema", label: "Schema\nValidation", x: 700, y: 400 },
          { id: "glob", label: "Glob Pattern\nTesting", x: 1000, y: 400 },
          { id: "collection", label: "Update\nCollection YAML", x: 1300, y: 400 },
          { id: "plugin", label: "Regenerate\nPlugins", x: 1600, y: 400 },
        ],
        connections: [
          { from: "create", to: "frontmatter" },
          { from: "frontmatter", to: "schema" },
          { from: "schema", to: "glob" },
          { from: "glob", to: "collection" },
          { from: "collection", to: "plugin" },
        ],
      },
    },
  },

  // Module 13: Agent architecture with subagents
  13: {
    "agent-architecture": {
      type: "architecture",
      title: "Custom Agent Architecture",
      props: {
        nodes: [
          { id: "parent", label: "Parent Agent\n(.agent.md)", x: 540, y: 100 },
          { id: "frontmatter", label: "Frontmatter\n(tools, agents)", x: 120, y: 100 },
          { id: "sub1", label: "Researcher\nSubagent", x: 240, y: 380 },
          { id: "sub2", label: "Planner\nSubagent", x: 600, y: 380 },
          { id: "sub3", label: "Implementor\nSubagent", x: 960, y: 380 },
          { id: "instructions", label: "Attached\nInstructions", x: 1300, y: 100 },
          { id: "skills", label: "Referenced\nSkills", x: 1300, y: 380 },
          { id: "boundary", label: "Collection Boundary", x: 400, y: 540, width: 700, height: 120 },
        ],
        connections: [
          { from: "frontmatter", to: "parent" },
          { from: "parent", to: "sub1" },
          { from: "parent", to: "sub2" },
          { from: "parent", to: "sub3" },
          { from: "parent", to: "instructions" },
          { from: "sub3", to: "skills" },
        ],
      },
    },
  },

  // Module 14: Complete skill anatomy
  14: {
    "skill-anatomy": {
      type: "block",
      title: "Complete Skill Package",
      props: {
        items: [
          {
            id: "root",
            label: ".github/skills/{collection}/{skill}/",
            description: "Skill root directory under collection namespace",
            x: 340,
            y: 60,
            width: 780,
            height: 100,
          },
          {
            id: "skillmd",
            label: "SKILL.md",
            description: "Required: Domain instructions, orchestration, and coaching logic",
            x: 120,
            y: 220,
            width: 480,
            height: 120,
          },
          {
            id: "pyproject",
            label: "pyproject.toml",
            description: "Required: ruff config, pytest options, dependencies",
            x: 680,
            y: 220,
            width: 480,
            height: 120,
          },
          {
            id: "scripts",
            label: "scripts/",
            description: "Python and PowerShell automation",
            x: 120,
            y: 400,
            width: 320,
            height: 120,
          },
          {
            id: "references",
            label: "references/",
            description: "Standards docs and domain knowledge",
            x: 500,
            y: 400,
            width: 320,
            height: 120,
          },
          {
            id: "tests",
            label: "tests/",
            description: "pytest suite and fuzz_harness.py",
            x: 880,
            y: 400,
            width: 320,
            height: 120,
          },
          {
            id: "assets",
            label: "assets/",
            description: "Templates, schemas, static config",
            x: 120,
            y: 580,
            width: 320,
            height: 120,
          },
          {
            id: "extra",
            label: "Additional .md files",
            description: "Referenced by SKILL.md for extended content",
            x: 500,
            y: 580,
            width: 320,
            height: 120,
          },
        ],
      },
    },
  },

  // Module 15: Design Thinking 9-method flow
  15: {
    "design-thinking-methods": {
      type: "flow",
      title: "Design Thinking: 9 Methods",
      props: {
        steps: [
          { id: "m1", label: "1. Scope", x: 100, y: 200 },
          { id: "m2", label: "2. Research", x: 300, y: 200 },
          { id: "m3", label: "3. Synthesis", x: 500, y: 200 },
          { id: "divider", label: "Problem → Solution Space", x: 700, y: 400 },
          { id: "m4", label: "4. Brainstorm", x: 900, y: 200 },
          { id: "m5", label: "5. Concepts", x: 1100, y: 200 },
          { id: "m6", label: "6. Lo-Fi\nPrototype", x: 1300, y: 200 },
          { id: "m7", label: "7. Hi-Fi\nPrototype", x: 100, y: 600 },
          { id: "m8", label: "8. Test &\nValidate", x: 400, y: 600 },
          { id: "m9", label: "9. Iterate\nat Scale", x: 700, y: 600 },
        ],
        connections: [
          { from: "m1", to: "m2" },
          { from: "m2", to: "m3" },
          { from: "m3", to: "divider" },
          { from: "divider", to: "m4" },
          { from: "m4", to: "m5" },
          { from: "m5", to: "m6" },
          { from: "m6", to: "m7" },
          { from: "m7", to: "m8" },
          { from: "m8", to: "m9" },
          { from: "m8", to: "m6", label: "Iterate back" },
        ],
      },
    },
  },

  // Module 16: Security planners block
  16: {
    "security-planners": {
      type: "block",
      title: "Security & RAI Planning Agents",
      props: {
        items: [
          {
            id: "security",
            label: "Security Planner",
            description: "6 phases: Capture → Risk Screen → Standards → Security Model → Impact → Backlog",
            x: 120,
            y: 100,
            width: 500,
            height: 260,
          },
          {
            id: "rai",
            label: "RAI Planner",
            description: "6 phases: Capture → Risk Classification → Standards → STRIDE → Impact → Backlog",
            x: 700,
            y: 100,
            width: 500,
            height: 260,
          },
          {
            id: "sssc",
            label: "SSSC Planner",
            description: "6 phases: Capture → Assessment → Standards → Gap Analysis → Backlog → Handoff",
            x: 120,
            y: 440,
            width: 500,
            height: 260,
          },
          {
            id: "shared",
            label: "Shared Infrastructure",
            description: "State persistence, session recovery, researcher subagent, disclaimer language",
            x: 700,
            y: 440,
            width: 500,
            height: 260,
          },
        ],
      },
    },
  },

  // Module 17: Supply chain security pipeline
  17: {
    "supply-chain-pipeline": {
      type: "flow",
      title: "Supply Chain Security Pipeline",
      props: {
        steps: [
          { id: "commit", label: "Commit", x: 100, y: 400 },
          { id: "sha", label: "SHA Pinning\nCheck", x: 340, y: 400 },
          { id: "gitleaks", label: "Gitleaks\nSecret Scan", x: 580, y: 400 },
          { id: "codeql", label: "CodeQL\nAnalysis", x: 820, y: 400 },
          { id: "sbom", label: "SBOM\nGeneration", x: 1060, y: 400 },
          { id: "attest", label: "Sigstore\nAttestation", x: 1300, y: 400 },
          { id: "release", label: "Verified\nRelease", x: 1540, y: 400 },
        ],
        connections: [
          { from: "commit", to: "sha" },
          { from: "sha", to: "gitleaks" },
          { from: "gitleaks", to: "codeql" },
          { from: "codeql", to: "sbom" },
          { from: "sbom", to: "attest" },
          { from: "attest", to: "release" },
        ],
      },
    },
  },

  // Module 18: CI/CD architecture
  18: {
    "cicd-architecture": {
      type: "architecture",
      title: "CI/CD Pipeline Architecture",
      props: {
        nodes: [
          { id: "trigger", label: "PR / Push\nTrigger", x: 120, y: 370 },
          { id: "orchestrator", label: "CI Orchestrator\nWorkflow", x: 480, y: 370 },
          { id: "validate", label: "Validation\nWorkflows", x: 880, y: 120 },
          { id: "security", label: "Security\nWorkflows", x: 880, y: 370 },
          { id: "release", label: "Release\nWorkflows", x: 880, y: 620 },
          { id: "lint", label: "lint:all", x: 1240, y: 60 },
          { id: "test", label: "test:ps / test:py", x: 1240, y: 180 },
          { id: "pinning", label: "Dependency Pinning", x: 1240, y: 310 },
          { id: "codeql", label: "CodeQL", x: 1240, y: 430 },
          { id: "sbom", label: "SBOM + Attest", x: 1240, y: 560 },
          { id: "publish", label: "Marketplace Publish", x: 1240, y: 680 },
        ],
        connections: [
          { from: "trigger", to: "orchestrator" },
          { from: "orchestrator", to: "validate" },
          { from: "orchestrator", to: "security" },
          { from: "orchestrator", to: "release" },
          { from: "validate", to: "lint" },
          { from: "validate", to: "test" },
          { from: "security", to: "pinning" },
          { from: "security", to: "codeql" },
          { from: "release", to: "sbom" },
          { from: "release", to: "publish" },
        ],
      },
    },
  },

  // Module 19: Enterprise topology
  19: {
    "enterprise-topology": {
      type: "architecture",
      title: "Enterprise HVE Topology",
      props: {
        nodes: [
          { id: "teamA", label: "Team A\n(Platform)", x: 100, y: 140 },
          { id: "teamB", label: "Team B\n(Backend)", x: 100, y: 370 },
          { id: "teamC", label: "Team C\n(Frontend)", x: 100, y: 600 },
          { id: "colShared", label: "Shared\nCollection", x: 460, y: 140 },
          { id: "colBackend", label: "Backend\nCollection", x: 460, y: 370 },
          { id: "colFrontend", label: "Frontend\nCollection", x: 460, y: 600 },
          { id: "colOrg", label: "Org-Wide\nCollection", x: 460, y: 820 },
          { id: "extPlatform", label: "Platform\nExtension", x: 840, y: 250 },
          { id: "extProduct", label: "Product\nExtension", x: 840, y: 500 },
          { id: "copilotA", label: "Copilot\n(Team A)", x: 1220, y: 140 },
          { id: "copilotB", label: "Copilot\n(Team B)", x: 1220, y: 370 },
          { id: "copilotC", label: "Copilot\n(Team C)", x: 1220, y: 600 },
        ],
        connections: [
          { from: "teamA", to: "colShared" },
          { from: "teamB", to: "colBackend" },
          { from: "teamC", to: "colFrontend" },
          { from: "colShared", to: "extPlatform" },
          { from: "colBackend", to: "extProduct" },
          { from: "colFrontend", to: "extProduct" },
          { from: "colOrg", to: "extPlatform" },
          { from: "colOrg", to: "extProduct" },
          { from: "extPlatform", to: "copilotA" },
          { from: "extProduct", to: "copilotB" },
          { from: "extProduct", to: "copilotC" },
        ],
      },
    },
  },

  // Module 20: Contribution pipeline
  20: {
    "contribution-pipeline": {
      type: "flow",
      title: "Contributing to HVE Core",
      props: {
        steps: [
          { id: "fork", label: "Fork\nRepository", x: 100, y: 400 },
          { id: "branch", label: "Create\nBranch", x: 340, y: 400 },
          { id: "develop", label: "Develop\nChanges", x: 580, y: 400 },
          { id: "validate", label: "Run\nlint:all + test:ps", x: 820, y: 400 },
          { id: "pr", label: "Open\nPull Request", x: 1060, y: 400 },
          { id: "review", label: "CI + Code\nReview", x: 1300, y: 400 },
          { id: "merge", label: "Merge to\nMain", x: 1540, y: 400 },
        ],
        connections: [
          { from: "fork", to: "branch" },
          { from: "branch", to: "develop" },
          { from: "develop", to: "validate" },
          { from: "validate", to: "pr" },
          { from: "pr", to: "review" },
          { from: "review", to: "merge" },
          { from: "review", to: "develop", label: "Revisions needed" },
        ],
      },
    },
  },
};
