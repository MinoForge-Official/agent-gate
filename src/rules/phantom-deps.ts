/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import fs from 'node:fs';
import path from 'node:path';
import { FileDiff, Issue } from '../types.js';

const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
  'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector',
  'module', 'net', 'os', 'path', 'path/posix', 'path/win32', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'readline/promises',
  'repl', 'stream', 'stream/consumers', 'stream/promises', 'stream/web',
  'string_decoder', 'test', 'timers', 'timers/promises', 'tls', 'trace_events',
  'tty', 'url', 'util', 'util/types', 'v8', 'vm', 'wasi', 'worker_threads',
  'zlib'
]);

function getProjectDependencies(cwd: string): Set<string> {
  const deps = new Set<string>();
  const pkgPath = path.join(cwd, 'package.json');

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        if (pkg[section] && typeof pkg[section] === 'object') {
          for (const dep of Object.keys(pkg[section])) {
            deps.add(dep);
          }
        }
      }
    } catch {
      // Ignore invalid package.json
    }
  }

  // Also check requirements.txt for python
  const reqPath = path.join(cwd, 'requirements.txt');
  if (fs.existsSync(reqPath)) {
    try {
      const content = fs.readFileSync(reqPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.trim().match(/^([a-zA-Z0-9_\-]+)/);
        if (match) deps.add(match[1].toLowerCase());
      }
    } catch {
      // Ignore
    }
  }

  return deps;
}

function extractPackageName(importPath: string): string | null {
  const clean = importPath.trim().replace(/^['"`]|['"`];?$/g, '');
  if (clean.startsWith('.') || clean.startsWith('/') || clean.startsWith('~') || clean.startsWith('@/')) {
    return null; // Local or alias path
  }

  if (clean.startsWith('node:')) {
    return null; // Node built-in
  }

  if (NODE_BUILTINS.has(clean) || NODE_BUILTINS.has(clean.split('/')[0])) {
    return null; // Built-in
  }

  // Scoped package: @org/package/subpath -> @org/package
  if (clean.startsWith('@')) {
    const parts = clean.split('/');
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    return clean;
  }

  // Regular package: lodash/chunk -> lodash
  return clean.split('/')[0];
}

export function checkPhantomDependencies(file: FileDiff, cwd = process.cwd()): Issue[] {
  const issues: Issue[] = [];
  if (file.isDeleted) return issues;

  // Only check JS/TS files
  const ext = path.extname(file.newPath).toLowerCase();
  if (!['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx'].includes(ext)) {
    return issues;
  }

  // If there's no package.json in the project, skip
  if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    return issues;
  }

  const projectDeps = getProjectDependencies(cwd);

  const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|require\s*\(\s*)['"]([^'"]+)['"]/g;

  for (const hunk of file.hunks) {
    for (const dl of hunk.lines) {
      if (dl.type !== 'add') continue;

      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(dl.content)) !== null) {
        const importSpecifier = match[1];
        const pkgName = extractPackageName(importSpecifier);

        if (pkgName && !projectDeps.has(pkgName)) {
          issues.push({
            id: `phantom-dep-${file.newPath}-${dl.newLineNumber}-${pkgName}`,
            rule: 'phantom-dependencies',
            file: file.newPath,
            line: dl.newLineNumber,
            severity: 'error',
            message: `Hallucinated / Phantom dependency "${pkgName}" imported but not declared in package.json.`,
            snippet: dl.content.trim(),
            suggestion: `Run 'npm install ${pkgName}' or verify if the AI agent intended to use a local module.`,
          });
        }
      }
    }
  }

  return issues;
}
