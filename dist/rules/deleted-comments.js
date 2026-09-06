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
function isCodeFile(path) {
    const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
    return CODE_EXTENSIONS.has(ext);
}
function isCommentLine(line, ext) {
    const trimmed = line.trim();
    if (!trimmed)
        return false;
    if (ext === '.py' || ext === '.pyi' || ext === '.rb') {
        return trimmed.startsWith('#') || trimmed.startsWith('"""') || trimmed.startsWith("'''");
    }
    // JS/TS/Go/Rust/C++/Java style
    return (trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.endsWith('*/'));
}
export function checkDeletedComments(file) {
    const issues = [];
    if (file.isDeleted || !isCodeFile(file.newPath)) {
        return issues;
    }
    const ext = file.newPath.slice(file.newPath.lastIndexOf('.')).toLowerCase();
    for (const hunk of file.hunks) {
        const deletedComments = [];
        let addedCommentCount = 0;
        for (const dl of hunk.lines) {
            if (dl.type === 'del' && isCommentLine(dl.content, ext)) {
                // Ignore single-character noise or trivial comments
                if (dl.content.trim().length > 2) {
                    deletedComments.push({ line: dl.content.trim(), lineNum: dl.oldLineNumber });
                }
            }
            else if (dl.type === 'add' && isCommentLine(dl.content, ext)) {
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
//# sourceMappingURL=deleted-comments.js.map