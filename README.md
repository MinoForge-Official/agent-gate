<div align="center">

# agent-gate

**A fast git diff linter that catches silent issues introduced by AI coding assistants.**

<br/>

<img src="./assets/logo.svg" width="160" alt="agent-gate logo"/>

<br/><br/>

Built by **MinoForge-Official**

<br/>

[Quickstart](#quickstart) • [Rules](#rules) • [Pre-commit Hook](#pre-commit-hook) • [CI Setup](#github-actions-ci) • [CLI Flags](#cli-options) • [FAQ](#faq)

<br/>

[![npm](https://img.shields.io/npm/v/agent-gate?style=flat-square&color=black)](https://www.npmjs.com/package/agent-gate)
[![license](https://img.shields.io/badge/license-Custom-red?style=flat-square)](LICENSE)
[![dependencies](https://img.shields.io/badge/dependencies-0-success?style=flat-square)](package.json)
[![node](https://img.shields.io/badge/node-%3E%3D20-green?style=flat-square)](package.json)

</div>

---

### What is this?

Tools like Cursor, Claude Code, and Copilot are great at writing features, but they frequently make unwanted changes behind your back:

- **Wiping out existing comments and docstrings** to save context space.
- **Adding `// @ts-ignore` or `# noqa`** just to silence compiler errors instead of fixing types.
- **Importing packages that aren't installed** in your `package.json` (hallucinated imports).
- **Wrapping blocks in empty `catch {}`** to suppress errors so their code runs.
- **Leaving `// TODO: implement later` stubs** in functions you asked them to build.
- **Reformatting untouched files** with random whitespace or newline changes.

`agent-gate` runs against your `git diff` (either staged changes or between branches) and catches these issues before they get committed or merged.

It has **zero external runtime dependencies**, starts up in **under 30ms**, and works with JavaScript, TypeScript, Python, and other common languages.

---

### Table of Contents

1. [Quickstart](#quickstart)
2. [Example Output](#example-output)
3. [Rules](#rules)
4. [Pre-commit Hook](#pre-commit-hook)
5. [GitHub Actions CI](#github-actions-ci)
6. [Scoring](#scoring)
7. [CLI Options](#cli-options)
8. [Programmatic API](#programmatic-api)
9. [FAQ](#faq)
10. [License](#license)

---

### Quickstart

Run it directly with `npx` in any git repository:

```bash
# Check uncommitted changes in your current working tree
npx agent-gate

# Check only staged files (useful before git commit)
npx agent-gate --staged

# Check a PR branch against main
npx agent-gate --base origin/main
```

Or install it globally if you prefer:

```bash
npm install -g agent-gate
```

---

### Example Output

```text
  Scanned: 3 files (+38 / -14)
  Cleanliness Score: 77/100 [NEEDS ATTENTION]

  Detected Issues (3):

  📄 src/auth/session.ts
     WARN   deleted-comments:L42
        Stripped comment or docstring without replacing it.
        > // Important: session token must be validated against redis whitelist
        Fix: Restore the comment or verify that the logic was intentionally removed.

  📄 src/db/client.ts
     ERROR  silent-type-suppression:L19
        Added silent compiler suppression: "@ts-ignore".
        > // @ts-ignore
        Fix: Resolve the type mismatch instead of suppressing the compiler.

  📄 src/utils/string.ts
     ERROR  phantom-dependencies:L2
        Imported package "lodash-es" is not listed in package.json.
        > import { camelCase } from 'lodash-es';
        Fix: Add lodash-es to package.json dependencies or use a local helper.

  ─────────────────────────────────────────────────────────────────
  Summary: 2 errors, 1 warning, 0 suggestions
```

---

### Rules

| Rule | Default Level | What it checks |
| :--- | :---: | :--- |
| `silent-type-suppression` | Error | Detects newly added `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `eslint-disable`, `# noqa`, and `# type: ignore`. |
| `phantom-dependencies` | Error | Checks new `import` and `require` statements against your `package.json` dependencies and built-in Node modules. |
| `deleted-comments` | Warning | Flags lines where comments or docstrings were removed while surrounding code remained. |
| `empty-error-handling` | Warning | Flags newly added empty `catch (e) {}`, `catch {}`, or Python `except: pass` blocks. |
| `placeholder-code` | Info | Warns about leftover comments like `// TODO: implement`, `// placeholder`, or `/* insert logic here */`. |
| `ghost-edits` | Info | Identifies files in your diff that have no actual code changes other than whitespace or line-ending differences. |

To ignore a specific rule on a run, use `--ignore`:
```bash
npx agent-gate --ignore silent-type-suppression,ghost-edits
```

---

### Pre-commit Hook

To prevent messy AI changes from ever being committed to git:

#### With Husky
```bash
npx husky add .husky/pre-commit "npx agent-gate --staged --strict"
```

#### With Native Git Hooks (`.git/hooks/pre-commit`)
Create `.git/hooks/pre-commit` and make it executable:
```bash
#!/bin/sh
npx agent-gate --staged --strict
```

If any errors are found or the cleanliness score drops below 95 in `--strict` mode, the commit will be rejected with an explanation of what needs fixing.

---

### GitHub Actions CI

To run `agent-gate` on pull requests, add `.github/workflows/agent-gate.yml`:

```yaml
name: agent-gate

on:
  pull_request:
    branches: [ main ]

jobs:
  check-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run agent-gate
        run: npx --yes agent-gate --base origin/main --ci --strict
```

When run with `--ci`, it automatically emits GitHub workflow annotations so warnings and errors show up directly inline on PR diff lines.

---

### Scoring

`agent-gate` gives your diff a cleanliness score between 0 and 100:

- Starts at **100**.
- Each **error** deducts 15 points.
- Each **warning** deducts 8 points.
- Each **info** note deducts 3 points.

In regular mode, any score $\ge$ 80 passes. In `--strict` mode, the score must be $\ge$ 95 and there must be 0 errors.

---

### CLI Options

```text
Usage: agent-gate [options]

Options:
  --staged              Inspect staged git changes only
  --base <ref>          Base git ref to compare against (e.g. main, origin/main)
  --head <ref>          Head git ref to compare (default: HEAD)
  --strict              Strict mode: requires 0 errors and score >= 95
  --threshold <num>     Custom score threshold to pass (default: 80)
  --ci                  Output GitHub Actions annotations (::error, ::warning)
  --json                Output results as JSON
  --ignore <rules>      Comma-separated list of rules to skip
  -h, --help            Show help
  -v, --version         Show version
```

---

### Programmatic API

You can also use the diff parser and rules engine directly in Node scripts:

```typescript
import { parseGitDiff, scanDiff } from 'agent-gate';

const diff = `...`; // unified diff string
const files = parseGitDiff(diff);
const report = scanDiff(files, { strict: false });

console.log(`Cleanliness: ${report.score}/100`);
```

---

### FAQ

**Does this send code anywhere?**  
No. Everything runs locally on your machine using fast string and regex checks. There are no API keys, no telemetry, and no outbound network calls.

**Why not just use ESLint?**  
ESLint checks entire files. It doesn't know what you just changed vs what was already there for years. `agent-gate` only inspects the lines in your active git diff, so it won't complain about legacy code you haven't touched.

**What languages are supported?**  
Rule support:
- TypeScript, JavaScript, JSX, TSX: all rules (including package.json checks).
- Python: comments, stubs, empty `except: pass`, and ghost edits.
- Go, Rust, C++, Java, Ruby, PHP: comment stripping, placeholders, and ghost edits.

---

### License
 
[Custom Non-Commercial & Source-Available License](LICENSE) © 2026 MinoForge-Official. All rights reserved. Unauthorized selling, re-uploading, and impersonation are strictly prohibited.
