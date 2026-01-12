export enum ProcessingStage {
  IDLE = 'IDLE',
  STAGE_1 = 'STAGE_1',
  STAGE_2 = 'STAGE_2',
  STAGE_3 = 'STAGE_3',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface FileData {
  name: string;
  type: string;
  data: string; // Base64 string
}

export interface NoteState {
  originalText: string;
  files: FileData[];
  stage1Output: string;
  stage2Output: string;
  finalOutput: string;
  status: ProcessingStage;
  error: string | null;
}
