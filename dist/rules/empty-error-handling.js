/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
export function checkEmptyErrorHandling(file) {
    const issues = [];
    if (file.isDeleted)
        return issues;
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
//# sourceMappingURL=empty-error-handling.js.map