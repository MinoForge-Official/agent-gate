/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
const PLACEHOLDER_PATTERNS = [
    { regex: /\/\/\s*TODO:\s*implement/i, label: 'TODO: implement' },
    { regex: /\/\/\s*TODO:\s*add\s+logic/i, label: 'TODO: add logic' },
    { regex: /\/\/\s*placeholder/i, label: 'placeholder comment' },
    { regex: /\/\*\s*placeholder\s*\*\//i, label: 'placeholder block' },
    { regex: /\/\/\s*(?:your\s+)?logic\s+goes\s+here/i, label: 'logic goes here' },
    { regex: /\/\/\s*stub\s+(?:implementation|function)/i, label: 'stub implementation' },
    { regex: /raise\s+NotImplementedError\s*\(\s*['"](?:TODO|implement)/i, label: 'NotImplementedError(TODO)' },
];
export function checkPlaceholderCode(file) {
    const issues = [];
    if (file.isDeleted)
        return issues;
    for (const hunk of file.hunks) {
        for (const dl of hunk.lines) {
            if (dl.type !== 'add')
                continue;
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
//# sourceMappingURL=placeholder-code.js.map