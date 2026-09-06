export function parseGitDiff(rawDiff) {
    const files = [];
    if (!rawDiff || !rawDiff.trim()) {
        return files;
    }
    // Split by diff --git header
    const rawFileChunks = rawDiff.split(/^diff --git /m).filter(Boolean);
    for (const chunk of rawFileChunks) {
        const lines = chunk.split('\n');
        const headerLine = lines[0] || '';
        // Header format: a/path/to/file b/path/to/file
        const headerMatch = headerLine.match(/^"?a\/(.+?)"?\s+"?b\/(.+?)"?$/);
        const oldPath = headerMatch ? headerMatch[1] : '';
        const newPath = headerMatch ? headerMatch[2] : '';
        let isNew = false;
        let isDeleted = false;
        let isRenamed = false;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('@@'))
                break;
            if (line.startsWith('new file mode'))
                isNew = true;
            if (line.startsWith('deleted file mode'))
                isDeleted = true;
            if (line.startsWith('similarity index') || line.startsWith('rename from'))
                isRenamed = true;
        }
        const hunks = [];
        let currentHunk = null;
        let oldLineNum = 0;
        let newLineNum = 0;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // Hunk header: @@ -1,5 +1,8 @@
            const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
            if (hunkMatch) {
                if (currentHunk) {
                    hunks.push(currentHunk);
                }
                oldLineNum = parseInt(hunkMatch[1], 10);
                const oldCount = hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1;
                newLineNum = parseInt(hunkMatch[3], 10);
                const newCount = hunkMatch[4] !== undefined ? parseInt(hunkMatch[4], 10) : 1;
                currentHunk = {
                    oldStart: oldLineNum,
                    oldCount,
                    newStart: newLineNum,
                    newCount,
                    lines: [],
                };
                continue;
            }
            if (!currentHunk)
                continue;
            if (line.startsWith('+')) {
                currentHunk.lines.push({
                    type: 'add',
                    content: line.slice(1),
                    newLineNumber: newLineNum,
                });
                newLineNum++;
            }
            else if (line.startsWith('-')) {
                currentHunk.lines.push({
                    type: 'del',
                    content: line.slice(1),
                    oldLineNumber: oldLineNum,
                });
                oldLineNum++;
            }
            else if (line.startsWith(' ')) {
                currentHunk.lines.push({
                    type: 'context',
                    content: line.slice(1),
                    oldLineNumber: oldLineNum,
                    newLineNumber: newLineNum,
                });
                oldLineNum++;
                newLineNum++;
            }
        }
        if (currentHunk) {
            hunks.push(currentHunk);
        }
        files.push({
            oldPath: oldPath || newPath,
            newPath: newPath || oldPath,
            isNew,
            isDeleted,
            isRenamed,
            hunks,
            rawHunkContent: chunk,
        });
    }
    return files;
}
//# sourceMappingURL=parser.js.map