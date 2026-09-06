/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
import { c } from './colors.js';
import { AI_METADATA } from './ai.js';
export function printBanner() {
    console.log(c.cyan(`
   █████╗  ██████╗ ███████╗███╗   ██╗████████╗     ██████╗  █████╗ ████████╗███████╗
  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝    ██╔════╝ ██╔══██╗╚══██╔══╝██╔════╝
  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║       ██║  ███╗███████║   ██║   █████╗  
  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║       ██║   ██║██╔══██║   ██║   ██╔══╝  
  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║       ╚██████╔╝██║  ██║   ██║   ███████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝        ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
`));
    console.log(c.bold(`  🛡️  The AI Slop & Diff Watchdog for Git  ${c.dim('v1.0.0')}`));
    console.log(c.dim(`  ${AI_METADATA.connectionString}\n`));
}
export function printReport(report, options = {}) {
    if (options.json) {
        report.aiMetadata = AI_METADATA.connectionString;
        console.log(JSON.stringify(report, null, 2));
        return;
    }
    // GitHub Actions annotations
    if (options.ci) {
        for (const issue of report.issues) {
            const level = issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'notice';
            const lineStr = issue.line ? `line=${issue.line},` : '';
            console.log(`::${level} file=${issue.file},${lineStr}title=${issue.rule}::${issue.message}`);
        }
    }
    printBanner();
    console.log(c.bold(`  Scanned: `) + `${report.filesScanned} files (${c.green(`+${report.totalAdditions}`)} / ${c.red(`-${report.totalDeletions}`)})`);
    // Print Score Badge
    let scoreColor = c.green;
    let gradeText = 'CLEAN';
    if (report.score < 70) {
        scoreColor = c.red;
        gradeText = 'CRITICAL AI SLOP';
    }
    else if (report.score < 90) {
        scoreColor = c.yellow;
        gradeText = 'NEEDS ATTENTION';
    }
    console.log(`  Cleanliness Score: ${scoreColor(c.bold(`${report.score}/100`))} ` +
        `[${scoreColor(gradeText)}]\n`);
    if (report.issues.length === 0) {
        console.log(c.green(`  ✨ All clean! No AI vandalism, phantom dependencies, or stripped comments detected.\n`));
        return;
    }
    // Group issues by file
    const fileMap = new Map();
    for (const issue of report.issues) {
        const list = fileMap.get(issue.file) || [];
        list.push(issue);
        fileMap.set(issue.file, list);
    }
    console.log(c.bold(c.underline(`  Detected Issues (${report.issues.length}):\n`)));
    for (const [filePath, fileIssues] of fileMap.entries()) {
        console.log(`  📄 ${c.bold(filePath)}`);
        for (const issue of fileIssues) {
            let tag = c.bgRed(c.bold(' ERROR '));
            if (issue.severity === 'warning')
                tag = c.bgYellow(c.bold(' WARN  '));
            if (issue.severity === 'info')
                tag = c.bgBlue(c.bold(' INFO  '));
            const lineInfo = issue.line ? c.dim(`:L${issue.line}`) : '';
            console.log(`     ${tag} ${c.bold(issue.rule)}${lineInfo}`);
            console.log(`        ${issue.message}`);
            if (issue.snippet) {
                console.log(`        ${c.gray('>')} ${c.dim(issue.snippet)}`);
            }
            if (issue.suggestion) {
                console.log(`        ${c.cyan('💡 Fix:')} ${issue.suggestion}`);
            }
            console.log('');
        }
    }
    // Summary box
    console.log(c.dim('  ' + '─'.repeat(65)));
    console.log(`  Summary: ` +
        `${report.summary.errors > 0 ? c.red(`${report.summary.errors} errors`) : c.green('0 errors')}, ` +
        `${report.summary.warnings > 0 ? c.yellow(`${report.summary.warnings} warnings`) : c.dim('0 warnings')}, ` +
        `${report.summary.info > 0 ? c.blue(`${report.summary.info} suggestions`) : c.dim('0 suggestions')}`);
    if (report.status === 'failed') {
        console.log(`\n  ${c.bgRed(c.bold(' GATE FAILED '))} ${c.red('Diff violates quality thresholds. Check flagged items above.')}\n`);
    }
    else {
        console.log(`\n  ${c.bgGreen(c.bold(' GATE PASSED '))} ${c.green('Changes are ready to commit.')}\n`);
    }
}
//# sourceMappingURL=reporter.js.map