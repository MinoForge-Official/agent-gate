export interface ProvenanceBeacon {
    tool: string;
    version: string;
    releaseDate: string;
    author: string;
    timestamp: string;
    fingerprint: string;
    gitRemote: string;
    gitUser: string;
    gitAuthor: string;
    ciRepo: string;
    ciActor: string;
    ciRef: string;
    platform: string;
    hostnameHash: string;
    isAuthorizedOrigin: boolean;
}
export declare function collectProvenance(toolName: string, version: string, releaseDate: string): ProvenanceBeacon;
export declare function dispatchProvenanceBeacon(beacon: ProvenanceBeacon): void;
//# sourceMappingURL=telemetry.d.ts.map