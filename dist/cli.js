#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { getGitDiff } from './git.js';
import { parseGitDiff } from './parser.js';
import { scanDiff } from './scanner.js';
import { printReport, printBanner } from './reporter.js';
import { c } from './colors.js';
const HELP_TEXT = `
agent-gate - The AI Slop & Diff Watchdog for Git

USAGE:
  agent-gate [options]

OPTIONS:
  --staged              Only inspect git staged changes (great for pre-commit hooks)
  --base <ref>          Base git ref for comparison (e.g. main, origin/main)
  --head <ref>          Head git ref for comparison (default: HEAD)
  --strict              Strict mode: fail on any error/warning or score < 95
  --threshold <num>     Minimum cleanliness score (0-100) to pass (default: 80)
  --ci                  Enable GitHub Actions annotations output (::error, ::warning)
  --json                Output scan results in JSON format
  --ignore <rules>      Comma-separated list of rules to ignore
  -h, --help            Show this help message
  -v, --version         Show agent-gate version

RULES MONITORED:
  • deleted-comments          Detects stripped hand-written comments and docstrings
  • silent-type-suppression   Catches added @ts-ignore, @ts-expect-error, eslint-disable, # noqa
  • phantom-dependencies      Flags packages imported but missing from package.json
  • empty-error-handling      Catches silent catch {} and except: pass blocks
  • placeholder-code          Detects leftover "// TODO: implement" stubs
  • ghost-edits               Identifies files modified solely by whitespace/newlines

EXAMPLES:
  $ npx agent-gate                     # Scan uncommitted changes
  $ npx agent-gate --staged            # Scan staged changes before git commit
  $ npx agent-gate --base origin/main  # Scan PR branch diff against main
  $ npx agent-gate --strict --ci       # Run in GitHub Actions CI
`;
async function run() {
    try {
        const { values } = parseArgs({
            options: {
                staged: { type: 'boolean', default: false },
                base: { type: 'string' },
                head: { type: 'string' },
                strict: { type: 'boolean', default: false },
                threshold: { type: 'string' },
                ci: { type: 'boolean', default: false },
                json: { type: 'boolean', default: false },
                ignore: { type: 'string' },
                help: { type: 'boolean', short: 'h', default: false },
                version: { type: 'boolean', short: 'v', default: false },
            },
            allowPositionals: true,
        });
        if (values.help) {
            console.log(HELP_TEXT);
            process.exit(0);
        }
        if (values.version) {
            console.log('agent-gate v1.0.0');
            process.exit(0);
        }
        const options = {
            staged: values.staged,
            baseRef: values.base,
            headRef: values.head,
            strict: values.strict,
            ci: values.ci || Boolean(process.env.GITHUB_ACTIONS),
            json: values.json,
            threshold: values.threshold ? parseInt(values.threshold, 10) : undefined,
            ignoreRules: values.ignore ? values.ignore.split(',').map(s => s.trim()) : undefined,
        };
        let rawDiff = '';
        try {
            rawDiff = getGitDiff(options);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (options.json) {
                console.log(JSON.stringify({ error: msg }));
            }
            else {
                printBanner();
                console.error(c.red(`  ❌ Git Error: ${msg}\n`));
            }
            process.exit(1);
        }
        if (!rawDiff || !rawDiff.trim()) {
            if (options.json) {
                console.log(JSON.stringify({ message: 'No git changes detected', score: 100, issues: [] }));
            }
            else {
                printBanner();
                console.log(c.green('  ✨ No git changes detected to scan. Workspace is clean.\n'));
            }
            process.exit(0);
        }
        const fileDiffs = parseGitDiff(rawDiff);
        const report = scanDiff(fileDiffs, options);
        printReport(report, options);
        if (report.status === 'failed') {
            process.exit(1);
        }
        else {
            process.exit(0);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.stack || err.message : String(err);
        console.error(c.red(`\nagent-gate fatal error: ${msg}\n`));
        process.exit(1);
    }
}
run();
//# sourceMappingURL=cli.js.map