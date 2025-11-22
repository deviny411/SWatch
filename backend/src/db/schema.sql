-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'WATCHER', 'ADMIN')),
  status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('OFFLINE', 'ONLINE', 'IN_CALL', 'AWAY')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  phone_number VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active TIMESTAMP,
  UNIQUE(phone_number)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  allow_anonymous BOOLEAN NOT NULL DEFAULT true,
  allow_recording BOOLEAN NOT NULL DEFAULT false,
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
  notification_enabled BOOLEAN NOT NULL DEFAULT true
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  relationship VARCHAR(100)
);

-- Watchers
CREATE TABLE IF NOT EXISTS watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'SUSPENDED', 'DEACTIVATED')),
  training_completed BOOLEAN NOT NULL DEFAULT false,
  background_check_completed BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT false,
  max_concurrent_calls INTEGER NOT NULL DEFAULT 1,
  current_call_count INTEGER NOT NULL DEFAULT 0,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_hours DECIMAL NOT NULL DEFAULT 0,
  emergencies_handled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watcher_id UUID NOT NULL REFERENCES watchers(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  issued_by VARCHAR(255) NOT NULL,
  issued_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Training modules
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL,
  content_url TEXT
);

-- Watcher training progress
CREATE TABLE IF NOT EXISTS watcher_training_progress (
  watcher_id UUID NOT NULL REFERENCES watchers(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  score DECIMAL,
  PRIMARY KEY (watcher_id, module_id)
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watcher_id UUID NOT NULL REFERENCES watchers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  calls_handled INTEGER DEFAULT 0
);

-- Calls
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  watcher_id UUID REFERENCES watchers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONNECTING', 'ACTIVE', 'ENDED', 'EMERGENCY')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('VIDEO', 'AUDIO_ONLY')),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  emergency_triggered BOOLEAN NOT NULL DEFAULT false
);

-- Emergency alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id),
  user_id UUID NOT NULL REFERENCES users(id),
  watcher_id UUID NOT NULL REFERENCES watchers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'TRIGGERED' CHECK (status IN ('TRIGGERED', 'DISPATCHED', 'RESPONDED', 'RESOLVED', 'CANCELLED')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  address TEXT,
  symptoms TEXT[],
  notes TEXT,
  triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_watchers_user_id ON watchers(user_id);
CREATE INDEX idx_watchers_available ON watchers(is_available, status) WHERE status = 'APPROVED';
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_watcher_id ON calls(watcher_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_emergency_alerts_call_id ON emergency_alerts(call_id);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_shifts_watcher_id ON shifts(watcher_id);
