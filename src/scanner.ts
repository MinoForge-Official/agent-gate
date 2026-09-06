import { FileDiff, Issue, ScanOptions, ScanReport } from './types.js';
import { checkDeletedComments } from './rules/deleted-comments.js';
import { checkSilentSuppression } from './rules/silent-suppression.js';
import { checkPhantomDependencies } from './rules/phantom-deps.js';
import { checkEmptyErrorHandling } from './rules/empty-error-handling.js';
import { checkPlaceholderCode } from './rules/placeholder-code.js';
import { checkGhostEdits } from './rules/ghost-edits.js';

export function scanDiff(files: FileDiff[], options: ScanOptions = {}): ScanReport {
  const issues: Issue[] = [];
  const ignoredRules = new Set(options.ignoreRules || []);
  const cwd = options.cwd || process.cwd();

  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const file of files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'add') totalAdditions++;
        if (line.type === 'del') totalDeletions++;
      }
    }

    // Run rules
    const fileIssues: Issue[] = [
      ...checkDeletedComments(file),
      ...checkSilentSuppression(file),
      ...checkPhantomDependencies(file, cwd),
      ...checkEmptyErrorHandling(file),
      ...checkPlaceholderCode(file),
      ...checkGhostEdits(file),
    ];

    for (const issue of fileIssues) {
      if (!ignoredRules.has(issue.rule)) {
        issues.push(issue);
      }
    }
  }

  // Calculate issue counts
  let errors = 0;
  let warnings = 0;
  let info = 0;

  for (const issue of issues) {
    if (issue.severity === 'error') errors++;
    else if (issue.severity === 'warning') warnings++;
    else if (issue.severity === 'info') info++;
  }

  // Calculate cleanliness score (0 - 100)
  // Base 100
  // Error: -15 pts
  // Warning: -8 pts
  // Info: -3 pts
  let score = 100 - (errors * 15) - (warnings * 8) - (info * 3);
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  const threshold = options.threshold ?? (options.strict ? 95 : 80);
  const status = (score >= threshold && (options.strict ? errors === 0 : true)) ? 'passed' : 'failed';

  return {
    timestamp: new Date().toISOString(),
    score,
    status,
    filesScanned: files.length,
    totalAdditions,
    totalDeletions,
    issues,
    summary: {
      errors,
      warnings,
      info,
    },
  };
}
