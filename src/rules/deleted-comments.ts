/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import { FileDiff, Issue } from '../types.js';

const CODE_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.jsx',
  '.ts', '.mts', '.cts', '.tsx',
  '.py', '.pyi',
  '.go',
  '.rs',
  '.java', '.kt', '.scala',
  '.c', '.cpp', '.h', '.hpp',
  '.cs',
  '.rb',
  '.php',
  '.swift',
]);

function isCodeFile(path: string): boolean {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return CODE_EXTENSIONS.has(ext);
}

function isCommentLine(line: string, ext: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  if (ext === '.py' || ext === '.pyi' || ext === '.rb') {
    return trimmed.startsWith('#') || trimmed.startsWith('"""') || trimmed.startsWith("'''");
  }

  // JS/TS/Go/Rust/C++/Java style
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.endsWith('*/')
  );
}

export function checkDeletedComments(file: FileDiff): Issue[] {
  const issues: Issue[] = [];
  if (file.isDeleted || !isCodeFile(file.newPath)) {
    return issues;
  }

  const ext = file.newPath.slice(file.newPath.lastIndexOf('.')).toLowerCase();

  for (const hunk of file.hunks) {
    const deletedComments: { line: string; lineNum?: number }[] = [];
    let addedCommentCount = 0;

    for (const dl of hunk.lines) {
      if (dl.type === 'del' && isCommentLine(dl.content, ext)) {
        // Ignore single-character noise or trivial comments
        if (dl.content.trim().length > 2) {
          deletedComments.push({ line: dl.content.trim(), lineNum: dl.oldLineNumber });
        }
      } else if (dl.type === 'add' && isCommentLine(dl.content, ext)) {
        addedCommentCount++;
      }
    }

    // If more than 1 significant comment was removed without being replaced
    if (deletedComments.length > 0 && addedCommentCount === 0) {
      for (const dc of deletedComments) {
        // Skip flagging if it was just an ignored suppression comment
        if (dc.line.includes('@ts-') || dc.line.includes('eslint-disable') || dc.line.includes('noqa')) {
          continue;
        }

        issues.push({
          id: `comment-stripped-${file.newPath}-${dc.lineNum}`,
          rule: 'deleted-comments',
          file: file.newPath,
          line: dc.lineNum,
          severity: 'warning',
          message: `AI agent stripped code comment/docstring without preserving it.`,
          snippet: dc.line,
          suggestion: 'Restore original comment or ensure documentation is retained.',
        });
      }
    }
  }

  return issues;
}
