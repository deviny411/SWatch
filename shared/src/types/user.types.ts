export enum UserRole {
  USER = 'USER',
  WATCHER = 'WATCHER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  IN_CALL = 'IN_CALL',
  AWAY = 'AWAY'
}

export interface User {
  id: string;
  role: UserRole;
  status: UserStatus;
  isAnonymous: boolean;
  createdAt: Date;
  lastActive?: Date;
}

export interface UserProfile extends User {
  phoneNumber?: string;
  emergencyContact?: EmergencyContact;
  preferences: UserPreferences;
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship?: string;
}

export interface UserPreferences {
  allowAnonymous: boolean;
  allowRecording: boolean;
  preferredLanguage: string;
  notificationEnabled: boolean;
}
