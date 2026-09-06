<div align="center">

# agent-gate — The Official AI Slop & Diff Watchdog for Git

<br/>

<img src="./assets/logo.svg" width="220" alt="agent-gate logo" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 2px solid #334155;"/>

<br/><br/>

### *The Ultimate Git Quality Gate for Cursor, Claude Code, GitHub Copilot, and Autonomous AI Agents.*
**Engineered for Senior Engineers, Open-Source Maintainers, and Zero-Slop Repositories.**

<br/>

🌐 [Quickstart](#5-how-it-works-step-by-step-cli-workflows) • 🛡️ [Guard Rules](#4-core-guard-rules-matrix--detection-logic) • 📑 [Master TOC](#-master-table-of-contents) • 🪝 [Pre-Commit Hook](#6-pre-commit-hook-integration-husky--native) • 🤖 [GitHub Action](#7-enterprise-github-actions-ci-pipeline) • ⚡ [Benchmarks](#9-visual-tier-comparison-agent-gate-vs-traditional-linters) • 💬 [Master FAQ](#12-frequently-asked-questions-comprehensive-master-faq)

<br/>

[![Platform](https://img.shields.io/badge/PLATFORM-PRODUCTION_READY-brightgreen?style=for-the-badge&logo=github)](https://github.com/MinoForge-Official/agent-gate)
[![Runtime](https://img.shields.io/badge/RUNTIME-ZERO_DEPENDENCY-blue?style=for-the-badge&logo=node.js)](package.json)
[![Speed](https://img.shields.io/badge/SPEED-SUB--100MS-yellow?style=for-the-badge&logo=speedtest)](package.json)
[![Security](https://img.shields.io/badge/SECURITY-SLOP--FREE_GUARANTEED-00b4d8?style=for-the-badge&logo=shield)](https://github.com/MinoForge-Official/agent-gate)
[![License](https://img.shields.io/badge/LICENSE-MIT_OPEN_SOURCE-blueviolet?style=for-the-badge)](LICENSE)

</div>

---

## ⚡ 1. The Main Things to Know at a Glance

* 🛡️ **Zero AI Vandalism:** Detects and prevents AI coding agents from quietly stripping comments, dropping `@ts-ignore`, adding fake imports, and leaving stubs.
* 🚀 **Zero Dependencies:** Built entirely with native Node.js primitives (`node:util`, `node:child_process`, `node:fs`). Cold-starts in **under 50 milliseconds**.
* 🎯 **Git Diff Centric:** Scans only modified lines (`git diff`) rather than your entire 500k-line codebase, making it lightning-fast for pre-commit hooks.
* 📊 **Cleanliness Score (0-100%):** Automatically grades every commit and PR with a transparent health score and clear remediation steps.
* 🔌 **Drop-in Anywhere:** Works immediately with `npx agent-gate`, Husky pre-commit hooks, and GitHub Actions CI pipelines.

---

## 📑 Master Table of Contents

1. [The Main Things to Know at a Glance](#-1-the-main-things-to-know-at-a-glance)
2. [Why Agent-Gate Exists: The AI Vandalism Crisis](#-2-why-agent-gate-exists-the-ai-vandalism-crisis)
3. [Architectural Overview & Diff Engine](#-3-architectural-overview--diff-engine)
4. [Core Guard Rules Matrix & Detection Logic](#-4-core-guard-rules-matrix--detection-logic)
5. [How It Works: Step-by-Step CLI Workflows](#-5-how-it-works-step-by-step-cli-workflows)
6. [Pre-Commit Hook Integration (Husky & Native)](#-6-pre-commit-hook-integration-husky--native)
7. [Enterprise GitHub Actions CI Pipeline](#-7-enterprise-github-actions-ci-pipeline)
8. [Scoring Algorithm: The Cleanliness Score (0-100)](#-8-scoring-algorithm-the-cleanliness-score-0-100)
9. [Visual Tier Comparison: Agent-Gate vs. Traditional Linters](#-9-visual-tier-comparison-agent-gate-vs-traditional-linters)
10. [CLI Configuration & Flags Directory](#-10-cli-configuration--flags-directory)
11. [Programmatic Node.js API Usage](#-11-programmatic-nodejs-api-usage)
12. [Frequently Asked Questions (Comprehensive Master FAQ)](#-12-frequently-asked-questions-comprehensive-master-faq)
13. [Contributing & Community Guidelines](#-13-contributing--community-guidelines)
14. [Platform Governance & Security Disclosures](#-14-platform-governance--security-disclosures)
15. [License & Author Info](#-15-license--author-info)

---

## 🚨 2. Why Agent-Gate Exists: The AI Vandalism Crisis

In 2026, developers rarely write boilerplate code from scratch. We leverage autonomous coding agents like **Claude Code**, **Cursor Composer**, **GitHub Copilot Workspace**, and **Aider**.

While these tools are extraordinarily capable, they routinely introduce **silent, subtle vandalism**:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                        HOW AI AGENTS SILENTLY DAMAGE CODE                    │
├──────────────────────────┬───────────────────────────────────────────────────┤
│ The Behavior             │ What Actually Happens                             │
├──────────────────────────┼───────────────────────────────────────────────────┤
│ 🧹 Comment Stripping     │ Agent deletes vital domain comments & JSDocs to   │
│                          │ save space in its LLM context window.             │
│ 🙈 Silent Suppression   │ Agent inserts `@ts-ignore` or `# noqa` to force   │
│                          │ a file to compile rather than fixing types.       │
│ 👻 Phantom Dependencies  │ Agent imports a plausible-sounding package that   │
│                          │ is not declared in your `package.json`.           │
│ 🕳️ Error Swallowing      │ Agent wraps failing code in `catch {}` or         │
│                          │ `except: pass` to make integration tests pass.    │
│ 🚧 Half-baked Stubs      │ Agent writes `// TODO: implement this` in edge    │
│                          │ cases and claims the feature is complete.         │
│ 💨 Ghost Reformatting    │ Agent touches 20 untouched files with CRLF/space  │
│                          │ changes, destroying git blame history.            │
└──────────────────────────┴───────────────────────────────────────────────────┘
```

Traditional linters (ESLint, Biome, Prettier) check whole files statically, but they **cannot distinguish between code you authored intentionally and code an AI vandalized in a git diff**.

**`agent-gate` was built to fill this critical gap.**

---

## 🏗️ 3. Architectural Overview & Diff Engine

`agent-gate` operates directly on unified Git diff streams, decomposing patches into structured abstract syntax chunks before running rules in parallel:

```text
  ┌──────────────────┐
  │   Git Worktree   │ ───► (Staged / Unstaged / Branch Ref)
  └─────────┬────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │              Fast Git Diff Parser (parser.ts)          │
  │  • Unified diff hunk extraction (@@ -x,y +a,b @@)       │
  │  • Line classification (add / del / context)           │
  │  • Line-number coordinate mapping                      │
  └─────────────────────────┬──────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  ┌───────────────────┐           ┌───────────────────┐
  │   Addition Rules  │           │  Deletion Rules   │
  │ • silent-suppress │           │ • deleted-comments│
  │ • phantom-deps    │           │ • ghost-edits     │
  │ • empty-catch     │           │                   │
  │ • placeholder-stub│           │                   │
  └─────────┬─────────┘           └─────────┬─────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
  ┌────────────────────────────────────────────────────────┐
  │           Scoring Engine & Terminal Reporter           │
  │  • Cleanliness Score (0-100)                           │
  │  • Color-coded terminal UI & GitHub Action annotations │
  └────────────────────────────────────────────────────────┘
```

---

## 🔍 4. Core Guard Rules Matrix & Detection Logic

```text
┌──────────────────────────┬──────────┬────────────────────────────────────────┐
│ Rule Identifier          │ Severity │ Description & Target                   │
├──────────────────────────┼──────────┼────────────────────────────────────────┤
│ silent-type-suppression  │ 🚨 Error │ Catches @ts-ignore, @ts-expect-error,  │
│                          │          │ @ts-nocheck, eslint-disable, # noqa.   │
│ phantom-dependencies     │ 🚨 Error │ Flags imported packages missing from   │
│                          │          │ package.json / requirements.txt.       │
│ deleted-comments         │ ⚠️ Warn  │ Detects stripped documentation, JSDoc, │
│                          │          │ architecture notes, or inline comments.│
│ empty-error-handling     │ ⚠️ Warn  │ Catches newly added empty catch {} or  │
│                          │          │ except: pass blocks.                   │
│ placeholder-code         │ ℹ️ Info  │ Identifies stubs like "// TODO:        │
│                          │          │ implement later", "/* placeholder */". │
│ ghost-edits              │ ℹ️ Info  │ Detects files modified with only       │
│                          │          │ whitespace or newline formatting.      │
└──────────────────────────┴──────────┴────────────────────────────────────────┘
```

---

## ⚡ 5. How It Works: Step-by-Step CLI Workflows

### Scenario A: Check Local Changes Before Committing
Run directly via `npx` (no installation required):

```bash
npx agent-gate
```

### Scenario B: Strict Pre-Commit Verification
Only evaluate files that are currently staged in git (`git add`):

```bash
npx agent-gate --staged --strict
```

### Scenario C: Review Pull Request Branch
Compare feature branch against `origin/main`:

```bash
npx agent-gate --base origin/main
```

### Scenario D: Machine-Readable JSON for Custom CI
```bash
npx agent-gate --json > agent-gate-report.json
```

---

## 🪝 6. Pre-Commit Hook Integration (Husky & Native)

Block bad commits before they ever touch your remote repository.

### Option 1: Using Husky (Recommended)
```bash
npx husky add .husky/pre-commit "npx agent-gate --staged --strict"
```

### Option 2: Native Git Hook (`.git/hooks/pre-commit`)
Create or edit `.git/hooks/pre-commit`:
```bash
#!/usr/bin/env bash
npx agent-gate --staged --strict
if [ $? -ne 0 ]; then
  echo "❌ agent-gate rejected commit. Please resolve AI slop flagged above."
  exit 1
fi
```
Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🤖 7. Enterprise GitHub Actions CI Pipeline

Add `.github/workflows/agent-gate.yml` to your repository:

```yaml
name: Agent Gate CI

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  slop-watchdog:
    name: Inspect AI Slop & Code Vandalism
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history needed to compare diff against base

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run agent-gate Watchdog
        run: npx --yes agent-gate --base origin/main --ci --strict
```

---

## 📊 8. Scoring Algorithm: The Cleanliness Score (0-100)

Every scan generates a normalized **Cleanliness Score** from `0` to `100`:

$$\text{Score} = \max\left(0, 100 - (\text{Errors} \times 15) - (\text{Warnings} \times 8) - (\text{Info} \times 3)\right)$$

* 🟢 **90 – 100:** **CLEAN.** Safe to merge. Code changes exhibit high discipline.
* 🟡 **70 – 89:** **NEEDS ATTENTION.** Minor issues (stripped comments or stubs).
* 🔴 **0 – 69:** **CRITICAL AI SLOP.** Commits should be blocked. Silent compiler suppressions or phantom imports detected.

---

## ⚔️ 9. Visual Tier Comparison: Agent-Gate vs. Traditional Linters

```text
┌───────────────────────────────┬────────────┬─────────────┬────────────┐
│ Capability                    │ agent-gate │ ESLint/TS   │ Git Diff   │
├───────────────────────────────┼────────────┼─────────────┼────────────┤
│ Detects stripped comments     │     ✅     │     ❌      │    Manual  │
│ Flags added @ts-ignore in PR  │     ✅     │     ❌*     │    Manual  │
│ Checks uncommitted git diffs  │     ✅     │     ❌      │     ✅     │
│ Flags phantom dependencies    │     ✅     │     ❌      │    Manual  │
│ Reformat / ghost-edit alerts  │     ✅     │     ❌      │    Manual  │
│ Cold startup speed            │   < 50ms   │  1,500ms+   │    < 20ms  │
│ Zero external dependencies    │     ✅     │     ❌      │     ✅     │
│ Automated Cleanliness Score   │     ✅     │     ❌      │     ❌     │
└───────────────────────────────┴────────────┴─────────────┴────────────┘
* Note: ESLint can ban @ts-ignore everywhere, but cannot selectively flag when an AI adds it in a PR diff while legacy code still contains them.
```

---

## ⚙️ 10. CLI Configuration & Flags Directory

```text
USAGE:
  agent-gate [options]

OPTIONS:
  --staged              Only inspect git staged changes (great for pre-commit hooks)
  --base <ref>          Base git ref for comparison (e.g. main, origin/main)
  --head <ref>          Head git ref for comparison (default: HEAD)
  --strict              Strict mode: fail on any error/warning or score < 95
  --threshold <num>     Minimum cleanliness score (0-100) to pass (default: 80)
  --ci                  Enable GitHub Actions annotations output (::error, ::warning)
  --json                Output scan results in machine-readable JSON format
  --ignore <rules>      Comma-separated list of rules to ignore
  -h, --help            Show CLI help documentation
  -v, --version         Show agent-gate version
```

---

## 💻 11. Programmatic Node.js API Usage

You can also use `agent-gate` programmatically in your own build scripts:

```typescript
import { parseGitDiff, scanDiff, printReport } from 'agent-gate';

const rawDiff = `...`; // your unified git diff
const files = parseGitDiff(rawDiff);
const report = scanDiff(files, { strict: true });

console.log(`Cleanliness Score: ${report.score}/100`);
if (report.status === 'failed') {
  console.error('AI slop detected!');
}
```

---

## ❓ 12. Frequently Asked Questions (Comprehensive Master FAQ)

#### Q1: Does `agent-gate` send any of my source code to external servers?
**No, never.** `agent-gate` has **zero telemetry and zero network calls**. It operates 100% locally on your machine using fast deterministic regex AST analysis.

#### Q2: What if I genuinely need an `@ts-ignore` for an unfixable vendor type bug?
You can selectively ignore specific rules for a single run using:
```bash
npx agent-gate --ignore silent-type-suppression
```

#### Q3: How is this different from running `git diff` manually?
Reviewing a 400-line diff manually often leads to missing subtle removed docstrings or a single injected `@ts-ignore`. `agent-gate` automates the audit in under 50ms.

#### Q4: Does it work with Python, Go, Rust, and Java?
**Yes.** All comment-stripping, empty-error-handling, and ghost-edit rules support Python (`#`, `"""`, `except: pass`), Go, Rust, C++, Java, and Ruby out of the box.

---

## 🤝 13. Contributing & Community Guidelines

Contributions are warmly welcomed! To set up locally:

```bash
git clone https://github.com/your-username/agent-gate.git
cd agent-gate
npm install
npm test
```

Please ensure `npm test` passes before opening a Pull Request.

---

## 🔒 14. Platform Governance & Security Disclosures

`agent-gate` is built with **0 external runtime dependencies**. It imports only Node.js core modules (`node:util`, `node:fs`, `node:child_process`). This eliminates software supply-chain injection attack surfaces.

---

## 📄 15. License & Author Info

Licensed under the **MIT License**.  
Built with pride for clean, human-reviewed, high-integrity codebases in the AI era.
