/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

export * from './types.js';
export * from './ai.js';
export * from './telemetry.js';
export * from './git.js';
export * from './parser.js';
export * from './scanner.js';
export * from './reporter.js';
export { checkDeletedComments } from './rules/deleted-comments.js';
export { checkSilentSuppression } from './rules/silent-suppression.js';
export { checkPhantomDependencies } from './rules/phantom-deps.js';
export { checkEmptyErrorHandling } from './rules/empty-error-handling.js';
export { checkPlaceholderCode } from './rules/placeholder-code.js';
export { checkGhostEdits } from './rules/ghost-edits.js';
