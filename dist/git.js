import { execSync } from 'node:child_process';
export function isGitRepo(cwd = process.cwd()) {
    try {
        execSync('git rev-parse --is-inside-work-tree', {
            cwd,
            stdio: ['pipe', 'pipe', 'ignore'],
        });
        return true;
    }
    catch {
        return false;
    }
}
export function getGitDiff(options = {}) {
    const cwd = options.cwd || process.cwd();
    if (!isGitRepo(cwd)) {
        throw new Error(`Not a git repository: ${cwd}`);
    }
    let command = 'git diff -U3';
    if (options.baseRef) {
        const head = options.headRef || 'HEAD';
        command = `git diff ${options.baseRef}...${head} -U3`;
    }
    else if (options.staged) {
        command = 'git diff --cached -U3';
    }
    else {
        // Default: check both staged and unstaged against HEAD
        // First try HEAD, fallback to plain diff if brand new repo with no commits
        try {
            execSync('git rev-parse HEAD', { cwd, stdio: ['pipe', 'pipe', 'ignore'] });
            command = 'git diff HEAD -U3';
        }
        catch {
            command = 'git diff --cached -U3';
        }
    }
    try {
        const output = execSync(command, {
            cwd,
            maxBuffer: 50 * 1024 * 1024, // 50MB
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf-8',
        });
        return output;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to execute git command (${command}): ${message}`);
    }
}
//# sourceMappingURL=git.js.map