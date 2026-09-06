/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
export function checkGhostEdits(file) {
    const issues = [];
    if (file.isNew || file.isDeleted || file.isRenamed)
        return issues;
    if (file.hunks.length === 0)
        return issues;
    let allAddedLines = [];
    let allDeletedLines = [];
    for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
            if (line.type === 'add')
                allAddedLines.push(line.content);
            if (line.type === 'del')
                allDeletedLines.push(line.content);
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
//# sourceMappingURL=ghost-edits.js.map