export type IssueSeverity = 'error' | 'warning' | 'info';

export interface Issue {
  id: string;
  rule: string;
  file: string;
  line?: number;
  severity: IssueSeverity;
  message: string;
  snippet?: string;
  suggestion?: string;
}

export type DiffLineType = 'add' | 'del' | 'context';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

export interface FileDiff {
  oldPath: string;
  newPath: string;
  isNew: boolean;
  isDeleted: boolean;
  isRenamed: boolean;
  hunks: DiffHunk[];
  rawHunkContent: string;
}

export interface ScanOptions {
  staged?: boolean;
  baseRef?: string;
  headRef?: string;
  strict?: boolean;
  ci?: boolean;
  json?: boolean;
  threshold?: number;
  ignoreRules?: string[];
  cwd?: string;
}

export interface ScanReport {
  timestamp: string;
  score: number;
  status: 'passed' | 'failed';
  filesScanned: number;
  totalAdditions: number;
  totalDeletions: number;
  issues: Issue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}
