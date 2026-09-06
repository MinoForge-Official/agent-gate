import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseGitDiff } from '../parser.js';
import { scanDiff } from '../scanner.js';
describe('agent-gate Diff Parser', () => {
    it('parses unified git diff correctly', () => {
        const rawDiff = `diff --git a/src/auth.ts b/src/auth.ts
index 1234567..89abcdef 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,7 @@ export function login() {
-  // Important: Validate session token before granting access
   const valid = checkToken();
+  // @ts-ignore
+  return valid;
 }`;
        const files = parseGitDiff(rawDiff);
        assert.strictEqual(files.length, 1);
        assert.strictEqual(files[0].newPath, 'src/auth.ts');
        assert.strictEqual(files[0].hunks.length, 1);
        assert.strictEqual(files[0].hunks[0].lines.length, 5);
    });
});
describe('agent-gate Rules Engine', () => {
    it('detects silent type suppression (@ts-ignore)', () => {
        const rawDiff = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,3 +1,4 @@
+// @ts-ignore
 const x: number = "hello";
`;
        const files = parseGitDiff(rawDiff);
        const report = scanDiff(files);
        assert.strictEqual(report.summary.errors, 1);
        assert.strictEqual(report.issues[0].rule, 'silent-type-suppression');
    });
    it('detects stripped comments', () => {
        const rawDiff = `diff --git a/src/calc.ts b/src/calc.ts
--- a/src/calc.ts
+++ b/src/calc.ts
@@ -5,4 +5,3 @@
-  // This formula calculates compound interest with inflation adjustment
-  // Do not alter without actuarial sign-off
   return principal * Math.pow(1 + rate, time);
`;
        const files = parseGitDiff(rawDiff);
        const report = scanDiff(files);
        assert.strictEqual(report.summary.warnings, 2);
        assert.strictEqual(report.issues[0].rule, 'deleted-comments');
    });
    it('detects empty catch blocks', () => {
        const rawDiff = `diff --git a/src/api.ts b/src/api.ts
--- a/src/api.ts
+++ b/src/api.ts
@@ -10,2 +10,4 @@
+  try { fetchData(); }
+  catch (e) {}
`;
        const files = parseGitDiff(rawDiff);
        const report = scanDiff(files);
        const emptyCatch = report.issues.find(i => i.rule === 'empty-error-handling');
        assert.ok(emptyCatch);
        assert.strictEqual(emptyCatch.severity, 'warning');
    });
    it('detects AI placeholder code stubs', () => {
        const rawDiff = `diff --git a/src/service.ts b/src/service.ts
--- a/src/service.ts
+++ b/src/service.ts
@@ -1,2 +1,3 @@
+// TODO: implement this function
`;
        const files = parseGitDiff(rawDiff);
        const report = scanDiff(files);
        const placeholder = report.issues.find(i => i.rule === 'placeholder-code');
        assert.ok(placeholder);
        assert.strictEqual(placeholder.severity, 'info');
    });
    it('detects ghost edits (whitespace only differences)', () => {
        const rawDiff = `diff --git a/src/config.json b/src/config.json
--- a/src/config.json
+++ b/src/config.json
@@ -1,3 +1,3 @@
-{ "name": "app" }
+{   "name": "app"   }
`;
        const files = parseGitDiff(rawDiff);
        const report = scanDiff(files);
        const ghost = report.issues.find(i => i.rule === 'ghost-edits');
        assert.ok(ghost);
    });
});
//# sourceMappingURL=agent-gate.test.js.map