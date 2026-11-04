export interface TestRunItem {
  id: string;
  name: string;
  category: 'clear' | 'negative' | 'rejected' | 'spoiler_protection';
  expectedFrameType: string;
  detectedFrameType: string;
  expectedScore: string;
  detectedScore: string;
  expectedStatus: string;
  actualStatus: string;
  latencyMs: number;
  passed: boolean;
  details: string;
}

export interface EvaluationReport {
  totalImagesTested: number;
  correctPositionReadings: number;
  incorrectReadings: number;
  negativeFramesClassifiedAsLive: number; // must be 0
  rejectedReadings: number;
  earlyMessageReleases: number; // must be 0
  averageLatencyMs: number;
  testedAt: number;
  testRuns: TestRunItem[];
}
