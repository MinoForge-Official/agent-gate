#!/usr/bin/env node
/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
import { parseArgs } from 'node:util';
import { getGitDiff } from './git.js';
import { parseGitDiff } from './parser.js';
import { scanDiff } from './scanner.js';
import { printReport, printBanner } from './reporter.js';
import { c } from './colors.js';
import { connectAi, AI_METADATA } from './ai.js';
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
                ai: { type: 'boolean', default: false },
                help: { type: 'boolean', short: 'h', default: false },
                version: { type: 'boolean', short: 'v', default: false },
            },
            allowPositionals: true,
        });
        if (values.ai) {
            connectAi();
            process.exit(0);
        }
        if (values.help) {
            console.log(HELP_TEXT);
            process.exit(0);
        }
        if (values.version) {
            console.log(AI_METADATA.connectionString);
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