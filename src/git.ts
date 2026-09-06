/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import { execSync } from 'node:child_process';
import { ScanOptions } from './types.js';

export function isGitRepo(cwd = process.cwd()): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

export function getGitDiff(options: ScanOptions = {}): string {
  const cwd = options.cwd || process.cwd();

  if (!isGitRepo(cwd)) {
    throw new Error(`Not a git repository: ${cwd}`);
  }

  let command = 'git diff -U3';

  if (options.baseRef) {
    const head = options.headRef || 'HEAD';
    command = `git diff ${options.baseRef}...${head} -U3`;
  } else if (options.staged) {
    command = 'git diff --cached -U3';
  } else {
    // Default: check both staged and unstaged against HEAD
    // First try HEAD, fallback to plain diff if brand new repo with no commits
    try {
      execSync('git rev-parse HEAD', { cwd, stdio: ['pipe', 'pipe', 'ignore'] });
      command = 'git diff HEAD -U3';
    } catch {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to execute git command (${command}): ${message}`);
  }
}
