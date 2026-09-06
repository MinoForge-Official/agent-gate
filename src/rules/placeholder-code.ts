import { FileDiff, Issue } from '../types.js';

const PLACEHOLDER_PATTERNS = [
  { regex: /\/\/\s*TODO:\s*implement/i, label: 'TODO: implement' },
  { regex: /\/\/\s*TODO:\s*add\s+logic/i, label: 'TODO: add logic' },
  { regex: /\/\/\s*placeholder/i, label: 'placeholder comment' },
  { regex: /\/\*\s*placeholder\s*\*\//i, label: 'placeholder block' },
  { regex: /\/\/\s*(?:your\s+)?logic\s+goes\s+here/i, label: 'logic goes here' },
  { regex: /\/\/\s*stub\s+(?:implementation|function)/i, label: 'stub implementation' },
  { regex: /raise\s+NotImplementedError\s*\(\s*['"](?:TODO|implement)/i, label: 'NotImplementedError(TODO)' },
];

export function checkPlaceholderCode(file: FileDiff): Issue[] {
  const issues: Issue[] = [];
  if (file.isDeleted) return issues;

  for (const hunk of file.hunks) {
    for (const dl of hunk.lines) {
      if (dl.type !== 'add') continue;

      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.regex.test(dl.content)) {
          issues.push({
            id: `placeholder-${file.newPath}-${dl.newLineNumber}`,
            rule: 'placeholder-code',
            file: file.newPath,
            line: dl.newLineNumber,
            severity: 'info',
            message: `Unfinished AI placeholder detected: "${pattern.label}".`,
            snippet: dl.content.trim(),
            suggestion: 'Ensure the AI agent actually finished implementing the requested feature before committing.',
          });
          break;
        }
      }
    }
  }

  return issues;
}
