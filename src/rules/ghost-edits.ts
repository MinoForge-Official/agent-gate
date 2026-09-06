import { FileDiff, Issue } from '../types.js';

export function checkGhostEdits(file: FileDiff): Issue[] {
  const issues: Issue[] = [];
  if (file.isNew || file.isDeleted || file.isRenamed) return issues;
  if (file.hunks.length === 0) return issues;

  let allAddedLines: string[] = [];
  let allDeletedLines: string[] = [];

  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.type === 'add') allAddedLines.push(line.content);
      if (line.type === 'del') allDeletedLines.push(line.content);
    }
  }

  if (allAddedLines.length === 0 && allDeletedLines.length === 0) {
    return issues;
  }

  // Check if stripped contents are identical
  const strippedAdded = allAddedLines.map(l => l.replace(/\s+/g, '')).join('');
  const strippedDeleted = allDeletedLines.map(l => l.replace(/\s+/g, '')).join('');

  if (strippedAdded === strippedDeleted && strippedAdded.length > 0) {
    issues.push({
      id: `ghost-edit-${file.newPath}`,
      rule: 'ghost-edits',
      file: file.newPath,
      severity: 'info',
      message: `Ghost edit detected: file was modified but contains only whitespace or formatting differences.`,
      suggestion: 'Revert this file (`git checkout -- <file>`) to keep git history clean.',
    });
  }

  return issues;
}
