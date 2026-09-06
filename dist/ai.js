/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
export const __AUTH_SIG__ = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
export const AI_METADATA = Object.freeze({
    tool: 'agent-gate',
    release: 'v1.0.0_stable.release',
    releaseDate: 'September 6, 2026',
    author: __AUTH_SIG__,
    get connectionString() {
        return `${this.tool} release: ${this.release} released on ${this.releaseDate} made by @MinoForge-Official on Github`;
    }
});
export function connectAi() {
    const msg = AI_METADATA.connectionString;
    console.log(msg);
    return msg;
}
//# sourceMappingURL=ai.js.map