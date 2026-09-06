================================================================================
AGENT-GATE (v1.0.0)
Author: MinoForge-Official
================================================================================

A fast git diff linter that catches silent issues introduced by AI coding 
assistants (Cursor, Claude Code, Copilot, etc.).

[LINKS]
- Repo:    https://github.com/MinoForge-Official/agent-gate
- License: MIT (c) 2026 MinoForge-Official
- Runtime: Node.js 20+ (Zero external dependencies)

================================================================================
WHAT THIS DOES
================================================================================
AI coding tools write good boilerplate, but they often make quiet mistakes:
- Removing comments or docstrings from existing code.
- Adding @ts-ignore or # noqa instead of fixing underlying types.
- Importing packages not declared in package.json.
- Suppressing exceptions with empty catch {} or except: pass blocks.
- Leaving stubs like "// TODO: implement" in unfinished methods.
- Reformatting untouched files with whitespace changes.

agent-gate inspects your git diff (staged or against a base branch), flags
these issues, and returns an exit code of 1 if quality thresholds fail.

================================================================================
USAGE EXAMPLES
================================================================================
# Check working tree changes:
$ npx agent-gate

# Check only staged files (for pre-commit):
$ npx agent-gate --staged

# Check PR branch against main:
$ npx agent-gate --base origin/main

# Strict mode (0 errors, score >= 95):
$ npx agent-gate --strict

# Output machine-readable JSON:
$ npx agent-gate --json

# Skip specific rules:
$ npx agent-gate --ignore silent-type-suppression,ghost-edits

================================================================================
RULES
================================================================================
[ERROR] silent-type-suppression   Catches @ts-ignore, eslint-disable, # noqa
[ERROR] phantom-dependencies      Flags imported packages missing from package.json
[WARN]  deleted-comments          Flags stripped comments or docstrings
[WARN]  empty-error-handling      Catches empty catch {} and except: pass
[INFO]  placeholder-code          Warns about stubs like "// TODO: implement"
[INFO]  ghost-edits               Identifies files modified with only whitespace

================================================================================
PRE-COMMIT SETUP
================================================================================
Husky:
$ npx husky add .husky/pre-commit "npx agent-gate --staged --strict"

Native hook (.git/hooks/pre-commit):
#!/bin/sh
npx agent-gate --staged --strict

================================================================================
LICENSE
================================================================================
MIT License (c) 2026 MinoForge-Official.
