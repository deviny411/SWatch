export enum EmergencyStatus {
  TRIGGERED = 'TRIGGERED',
  DISPATCHED = 'DISPATCHED',
  RESPONDED = 'RESPONDED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED'
}

export enum EmergencySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface EmergencyAlert {
  id: string;
  callId: string;
  userId: string;
  watcherId: string;
  status: EmergencyStatus;
  severity: EmergencySeverity;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  symptoms?: string[];
  triggeredAt: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  notes?: string;
}

export interface EmergencyDispatch {
  alertId: string;
  dispatchedTo: string;
  dispatchedAt: Date;
  estimatedArrival?: Date;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED';
}

export const OVERDOSE_SYMPTOMS = [
  'loss_of_consciousness',
  'slow_breathing',
  'no_breathing',
  'blue_lips',
  'unresponsive',
  'choking_sounds',
  'pale_skin'
] as const;

export type OverdoseSymptom = typeof OVERDOSE_SYMPTOMS[number];
