# Evaluations

This directory contains [Vally](https://www.npmjs.com/package/@microsoft/vally-cli) evaluation specs for hve-core.

## Architecture

```text
evals/
├── skill-quality/       copilot-sdk evals testing skill behavior
├── agent-behavior/      copilot-sdk evals testing agent responses
└── script-validation/   mock executor evals testing deterministic scripts
```

## Executors

| Suite | Executor | Purpose |
|-------|----------|---------|
| `skill-quality` | `copilot-sdk` | Tests that skills provide accurate guidance via real agent conversation |
| `agent-behavior` | `copilot-sdk` | Tests that agents respond correctly to domain prompts |
| `script-validation` | `mock` | Tests deterministic validation scripts with fixture files |

## Running evals

```bash
# Lint all eval specs (no execution, fast)
npm run eval:lint

# Run all evals
npm run eval

# Run a specific suite
npm run eval -- --suite skill-quality
npm run eval -- --suite deterministic

# Compare results against baseline
npm run eval:compare
```

## Adding new evals

1. Create a directory under `evals/` with an `eval.yaml`.
2. Choose the executor:
   - `copilot-sdk` for testing skill/agent behavior (non-deterministic, use `runs: 3`+).
   - `mock` for testing scripts/validators (deterministic, use `runs: 1`).
3. Write per-stimulus graders (one stimulus per test case).
4. Run `npm run eval:lint` to validate the spec.
5. Tag stimuli with `category` matching a suite filter in `.vally.yaml`.

## Anti-patterns

- Don't use `runs: 1` for copilot-sdk evals (non-deterministic output needs multiple runs).
- Don't set timeout below `120s` for copilot-sdk evals.
- Don't use `output-contains` as the sole grader for qualitative agent output.
- Don't bundle multiple test cases into one stimulus with an aggregate grader.
- Don't pin models in eval specs.
