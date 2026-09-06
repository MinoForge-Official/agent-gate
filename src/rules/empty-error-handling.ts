import { FileDiff, Issue } from '../types.js';

export function checkEmptyErrorHandling(file: FileDiff): Issue[] {
  const issues: Issue[] = [];
  if (file.isDeleted) return issues;

  // Search through hunks for empty catch blocks
  for (const hunk of file.hunks) {
    const addedLines = hunk.lines.filter(l => l.type === 'add');
    
    for (let i = 0; i < addedLines.length; i++) {
      const line = addedLines[i];
      const trimmed = line.content.trim();

      // Single-line empty catch: catch (e) {} or catch {}
      if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(trimmed)) {
        issues.push({
          id: `empty-catch-${file.newPath}-${line.newLineNumber}`,
          rule: 'empty-error-handling',
          file: file.newPath,
          line: line.newLineNumber,
          severity: 'warning',
          message: 'AI agent added an empty catch block that silently swallows errors.',
          snippet: trimmed,
          suggestion: 'Handle the error, log it, or rethrow instead of silencing failures.',
        });
        continue;
      }

      // Python style: except ...: pass
      if (/except(?:\s+[\w\s,()]+)?:\s*pass\b/.test(trimmed)) {
        issues.push({
          id: `empty-except-${file.newPath}-${line.newLineNumber}`,
          rule: 'empty-error-handling',
          file: file.newPath,
          line: line.newLineNumber,
          severity: 'warning',
          message: 'AI agent added an empty except block ("except: pass") that silently swallows exceptions.',
          snippet: trimmed,
          suggestion: 'Log the exception or handle expected error types explicitly.',
        });
        continue;
      }

      // Multi-line empty catch: catch (...) { \n }
      if (/catch\s*(?:\([^)]*\))?\s*\{$/.test(trimmed) && i + 1 < addedLines.length) {
        const nextTrimmed = addedLines[i + 1].content.trim();
        if (nextTrimmed === '}' || /^(?:\/\/[^\n]*|\/\*.*?\*\/)?\s*\}$/.test(nextTrimmed)) {
          issues.push({
            id: `empty-catch-${file.newPath}-${line.newLineNumber}`,
            rule: 'empty-error-handling',
            file: file.newPath,
            line: line.newLineNumber,
            severity: 'warning',
            message: 'AI agent added a multi-line empty catch block that silently swallows errors.',
            snippet: `${trimmed} ${nextTrimmed}`,
            suggestion: 'Handle the error or log it appropriately.',
          });
        }
      }
    }
  }

  return issues;
}
