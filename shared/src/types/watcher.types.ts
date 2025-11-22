export enum WatcherStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Watcher {
  id: string;
  userId: string;
  status: WatcherStatus;
  certifications: Certification[];
  trainingCompleted: boolean;
  backgroundCheckCompleted: boolean;
  availability: WatcherAvailability;
  stats: WatcherStats;
}

export interface Certification {
  type: string;
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  verified: boolean;
}

export interface WatcherAvailability {
  isAvailable: boolean;
  maxConcurrentCalls: number;
  currentCallCount: number;
  timezone: string;
}

export interface WatcherStats {
  totalCalls: number;
  totalHours: number;
  emergenciesHandled: number;
  averageRating?: number;
  lastActiveAt?: Date;
}

export interface Shift {
  id: string;
  watcherId: string;
  status: ShiftStatus;
  startTime: Date;
  endTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  callsHandled?: number;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  required: boolean;
  order: number;
  contentUrl?: string;
}

export interface WatcherTrainingProgress {
  watcherId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
  score?: number;
}
