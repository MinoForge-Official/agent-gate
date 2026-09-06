/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
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