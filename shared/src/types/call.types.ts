export enum CallStatus {
  PENDING = 'PENDING',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  EMERGENCY = 'EMERGENCY'
}

export enum CallType {
  VIDEO = 'VIDEO',
  AUDIO_ONLY = 'AUDIO_ONLY'
}

export interface Call {
  id: string;
  userId: string;
  watcherId?: string;
  status: CallStatus;
  type: CallType;
  startedAt: Date;
  endedAt?: Date;
  emergencyTriggered: boolean;
}

export interface CallSession {
  callId: string;
  userId: string;
  watcherId: string;
  status: CallStatus;
  type: CallType;
  location?: GeolocationCoordinates;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  callId: string;
  from: string;
  to: string;
  data: any;
}
