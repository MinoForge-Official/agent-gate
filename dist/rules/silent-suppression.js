const SUPPRESSION_PATTERNS = [
    { regex: /@ts-ignore/i, name: '@ts-ignore' },
    { regex: /@ts-expect-error/i, name: '@ts-expect-error' },
    { regex: /@ts-nocheck/i, name: '@ts-nocheck' },
    { regex: /eslint-disable(?:-next-line)?/i, name: 'eslint-disable' },
    { regex: /#\s*type:\s*ignore/i, name: '# type: ignore' },
    { regex: /#\s*noqa/i, name: '# noqa' },
    { regex: /\/\/\s*pylint:\s*disable/i, name: 'pylint: disable' },
    { regex: /@SuppressWarnings/i, name: '@SuppressWarnings' },
];
export function checkSilentSuppression(file) {
    const issues = [];
    if (file.isDeleted)
        return issues;
    for (const hunk of file.hunks) {
        for (const dl of hunk.lines) {
            if (dl.type !== 'add')
                continue;
            for (const pattern of SUPPRESSION_PATTERNS) {
                if (pattern.regex.test(dl.content)) {
                    issues.push({
                        id: `suppression-${file.newPath}-${dl.newLineNumber}`,
                        rule: 'silent-type-suppression',
                        file: file.newPath,
                        line: dl.newLineNumber,
                        severity: 'error',
                        message: `Added silent compiler/linter suppression: "${pattern.name}". AI agents often use this to bypass real type errors.`,
                        snippet: dl.content.trim(),
                        suggestion: 'Fix the underlying type or lint error instead of suppressing it.',
                    });
                    break;
                }
            }
        }
    }
    return issues;
}
//# sourceMappingURL=silent-suppression.js.map