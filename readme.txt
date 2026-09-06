================================================================================
AGENT-GATE - The AI Slop & Diff Watchdog for Git (v1.0.0)
================================================================================

Stop autonomous AI agents from silently vandalizing your codebase.

[QUICK LINKS]
- Web: https://github.com/
- License: MIT Open Source
- Runtime: Node.js 20+ (Zero Dependencies)

================================================================================
1. OVERVIEW & PURPOSE
================================================================================
When AI agents (Claude Code, Cursor Composer, GitHub Copilot) edit code, they
often introduce silent vandalism:
- Deleting hand-written comments & docstrings to save LLM context.
- Injecting @ts-ignore, @ts-nocheck, or # noqa to suppress type errors.
- Importing hallucinated / phantom dependencies not in package.json.
- Wrapping failing code in empty catch {} or except: pass blocks.
- Leaving "// TODO: implement later" stubs.
- Reformatting untouched files with whitespace changes (ghost edits).

agent-gate analyzes your uncommitted or staged git diff, scores your code 
cleanliness (0-100%), and halts bad commits before they hit your repo.

================================================================================
2. QUICKSTART COMMANDS
================================================================================
# Scan uncommitted working tree changes
$ npx agent-gate

# Scan staged changes before git commit (recommended for pre-commit)
$ npx agent-gate --staged --strict

# Scan pull request diff against main branch
$ npx agent-gate --base origin/main

# Output machine-readable JSON
$ npx agent-gate --json

================================================================================
3. MONITORED RULES
================================================================================
[ERROR] silent-type-suppression   Catches added @ts-ignore, eslint-disable, # noqa
[ERROR] phantom-dependencies      Flags imported packages missing from package.json
[WARN]  deleted-comments          Detects stripped comments and JSDoc docstrings
[WARN]  empty-error-handling      Catches silent catch {} and except: pass blocks
[INFO]  placeholder-code          Identifies stubs like "// TODO: implement"
[INFO]  ghost-edits               Detects files modified with only whitespace

================================================================================
4. PRE-COMMIT HOOK INSTALLATION
================================================================================
Using Husky:
$ npx husky add .husky/pre-commit "npx agent-gate --staged --strict"

Native Git Hook (.git/hooks/pre-commit):
#!/usr/bin/env bash
npx agent-gate --staged --strict

================================================================================
5. SPECIFICATIONS
================================================================================
- Engine: Native Git Diff Stream Parser
- Cold Startup: < 50ms
- Network: Zero external telemetry / 100% offline local execution
- License: MIT (c) 2026
