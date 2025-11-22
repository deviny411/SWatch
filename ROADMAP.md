# SafeWatch MVP - Development Roadmap

## Current Status: ✅ Skeleton Complete

Clean, modular foundation with:
- Monorepo structure (frontend/backend/shared)
- TypeScript throughout
- Database schema designed
- Socket.io infrastructure
- Core modules scaffolded

---

## Implementation Roadmap

### Phase 1: Foundation & Authentication (Week 1-2)
**Priority: Critical - Everything depends on this**

#### 1.1 Database Connection & Models
- [ ] Implement PostgreSQL connection pool
- [ ] Create database models/repositories for each entity
- [ ] Add migration system (optional but recommended)
- [ ] Test database connectivity

**Files to implement:**
- `backend/src/models/user.model.ts`
- `backend/src/models/watcher.model.ts`
- `backend/src/models/call.model.ts`
- `backend/src/db/migrations/` (optional)

#### 1.2 Authentication System
- [ ] User registration (phone-based)
- [ ] Anonymous user creation
- [ ] JWT token generation/validation
- [ ] Login/logout endpoints
- [ ] Session management with Redis
- [ ] Auth middleware (already scaffolded, needs implementation)

**Files to implement:**
- `backend/src/services/auth.service.ts`
- `backend/src/controllers/auth.controller.ts` (enhance existing)
- `frontend/src/contexts/AuthContext.tsx` (enhance existing)

#### 1.3 User Profile Management
- [ ] Get/update user profile
- [ ] Manage preferences
- [ ] Add/update emergency contacts
- [ ] Privacy settings

**Files to implement:**
- `backend/src/services/user.service.ts`
- `backend/src/routes/user.routes.ts`
- `backend/src/controllers/user.controller.ts`
- `frontend/src/app/profile/page.tsx`

**Success Criteria:**
- ✅ Users can register/login
- ✅ Anonymous users can be created
- ✅ JWT tokens work properly
- ✅ User sessions persist
- ✅ Profile data is saved/retrieved

---

### Phase 2: Core Video Calling (Week 3-4)
**Priority: Critical - The main feature**

#### 2.1 WebRTC Peer Connection
- [ ] Implement WebRTC signaling via Socket.io
- [ ] Handle offer/answer/ICE candidates
- [ ] Media stream management (camera/microphone access)
- [ ] Peer connection lifecycle

**Files to implement:**
- `frontend/src/hooks/useWebRTC.ts`
- `frontend/src/hooks/useMediaStream.ts`
- `backend/src/services/signaling.service.ts`
- `backend/src/socket/call.socket.ts` (enhance existing)

#### 2.2 Call Matching & Queue
- [ ] Find available watchers
- [ ] Call request queue system
- [ ] Watcher availability tracking
- [ ] Call assignment logic
- [ ] Handle timeout/no watchers available

**Files to implement:**
- `backend/src/services/call-matching.service.ts`
- `backend/src/services/queue.service.ts` (using Redis)
- `backend/src/models/call.model.ts`

#### 2.3 Call Interface
- [ ] User call request flow
- [ ] Watcher call acceptance flow
- [ ] In-call controls (mute, video on/off, end call)
- [ ] Call status indicators
- [ ] Connection quality monitoring

**Files to implement:**
- `frontend/src/app/call/[callId]/page.tsx`
- `frontend/src/components/call/VideoCall.tsx` (enhance existing)
- `frontend/src/components/call/CallControls.tsx`
- `frontend/src/components/call/ConnectionStatus.tsx`

#### 2.4 Bandwidth Detection & Fallback
- [ ] Monitor connection quality
- [ ] Auto-fallback to audio-only on poor connection
- [ ] Manual video toggle
- [ ] Reconnection handling

**Files to implement:**
- `frontend/src/hooks/useBandwidthDetection.ts`
- `frontend/src/utils/connection-quality.ts`

**Success Criteria:**
- ✅ Users can request a watcher
- ✅ Watchers receive call requests
- ✅ Video/audio connects successfully
- ✅ Auto-fallback to audio works
- ✅ Calls can be ended properly

---

### Phase 3: Emergency Alert System (Week 5)
**Priority: Critical - Life-saving feature**

#### 3.1 Emergency Trigger
- [ ] Emergency button in call interface
- [ ] Confirmation dialog
- [ ] GPS location capture
- [ ] Symptom selection
- [ ] Create emergency alert record

**Files to implement:**
- `frontend/src/components/emergency/EmergencyButton.tsx` (enhance existing)
- `backend/src/services/emergency.service.ts`
- `backend/src/models/emergency.model.ts`

#### 3.2 Emergency Dispatch
- [ ] SMS integration (Twilio/AWS SNS)
- [ ] Send location to emergency services
- [ ] Notify watcher
- [ ] Notify admin/coordinators
- [ ] Alert status tracking

**Files to implement:**
- `backend/src/services/sms.service.ts`
- `backend/src/services/emergency-dispatch.service.ts`
- `backend/src/socket/emergency.socket.ts` (enhance existing)

#### 3.3 Emergency Dashboard (for coordinators)
- [ ] View active emergencies
- [ ] Track response status
- [ ] Update alert status
- [ ] View history

**Files to implement:**
- `frontend/src/app/admin/emergencies/page.tsx`
- `frontend/src/components/admin/EmergencyList.tsx`

**Success Criteria:**
- ✅ Emergency can be triggered during call
- ✅ SMS sent to emergency services
- ✅ Location is captured and sent
- ✅ All parties are notified
- ✅ Status is tracked properly

---

### Phase 4: Watcher Onboarding & Management (Week 6-7)
**Priority: High - Need watchers for the system to work**

#### 4.1 Watcher Application
- [ ] Application form
- [ ] Background check initiation
- [ ] Admin approval workflow
- [ ] Onboarding email/notifications

**Files to implement:**
- `frontend/src/app/watcher/apply/page.tsx`
- `backend/src/services/watcher.service.ts`
- `backend/src/models/watcher.model.ts`
- `backend/src/controllers/watcher.controller.ts` (enhance)

#### 4.2 Training Modules
- [ ] Training content delivery
- [ ] Progress tracking
- [ ] Quiz/assessment
- [ ] Completion certification

**Files to implement:**
- `frontend/src/app/watcher/training/page.tsx`
- `frontend/src/components/training/ModuleViewer.tsx`
- `backend/src/services/training.service.ts`
- `backend/src/models/training.model.ts`

#### 4.3 Shift Management
- [ ] Watcher availability toggle
- [ ] Shift scheduling
- [ ] Shift reminders
- [ ] Shift history

**Files to implement:**
- `frontend/src/app/watcher/shifts/page.tsx`
- `backend/src/services/shift.service.ts`
- `backend/src/models/shift.model.ts`

#### 4.4 Watcher Dashboard
- [ ] Active calls view
- [ ] Incoming call notifications
- [ ] Stats (calls handled, hours, etc.)
- [ ] Quick availability toggle

**Files to implement:**
- `frontend/src/app/watcher/dashboard/page.tsx`
- `frontend/src/components/watcher/CallQueue.tsx`
- `frontend/src/components/watcher/Stats.tsx`

**Success Criteria:**
- ✅ Watchers can apply
- ✅ Training can be completed
- ✅ Shifts can be scheduled
- ✅ Watchers can go online/offline
- ✅ Dashboard shows relevant info

---

### Phase 5: Privacy & Security Hardening (Week 8)
**Priority: High - Privacy is a core principle**

#### 5.1 Data Protection
- [ ] Implement data retention policies
- [ ] Auto-delete old call records
- [ ] Encrypt sensitive data
- [ ] Audit logging (what, not content)

**Files to implement:**
- `backend/src/services/data-retention.service.ts`
- `backend/src/utils/encryption.ts`
- `backend/src/middleware/audit.middleware.ts`

#### 5.2 Security Enhancements
- [ ] Rate limiting
- [ ] Input validation/sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

**Files to implement:**
- `backend/src/middleware/rate-limit.middleware.ts`
- `backend/src/middleware/validation.middleware.ts`
- `backend/src/utils/sanitize.ts`

#### 5.3 Anonymous Mode Hardening
- [ ] Ensure no PII collection in anonymous mode
- [ ] Temporary user cleanup
- [ ] Minimal logging
- [ ] Privacy-preserving analytics

**Success Criteria:**
- ✅ Rate limiting prevents abuse
- ✅ Input is validated/sanitized
- ✅ Old data is auto-deleted
- ✅ Anonymous users are truly anonymous

---

### Phase 6: Offline & Low Connectivity Support (Week 9)
**Priority: Medium-High - Reliability is critical**

#### 6.1 SMS Fallback
- [ ] Detect poor connectivity
- [ ] Switch to SMS mode
- [ ] Pre-configured messages
- [ ] SMS status updates

**Files to implement:**
- `backend/src/services/sms-fallback.service.ts`
- `frontend/src/hooks/useConnectivity.ts`

#### 6.2 Progressive Web App (PWA)
- [ ] Service worker for offline support
- [ ] Cache critical assets
- [ ] Offline indicators
- [ ] Background sync

**Files to implement:**
- `frontend/public/sw.js`
- `frontend/src/hooks/useOnlineStatus.ts`

**Success Criteria:**
- ✅ App detects offline status
- ✅ SMS fallback works
- ✅ Critical features work offline
- ✅ User is notified of connectivity issues

---

### Phase 7: Admin Panel (Week 10)
**Priority: Medium - Needed for operations**

#### 7.1 User Management
- [ ] View all users
- [ ] Suspend/ban users
- [ ] View user activity
- [ ] Support tickets

**Files to implement:**
- `frontend/src/app/admin/users/page.tsx`
- `backend/src/services/admin.service.ts`

#### 7.2 Watcher Management
- [ ] Approve/reject applications
- [ ] View watcher performance
- [ ] Suspend watchers
- [ ] Manage certifications

**Files to implement:**
- `frontend/src/app/admin/watchers/page.tsx`

#### 7.3 Analytics & Monitoring
- [ ] Call volume stats
- [ ] Emergency response times
- [ ] Watcher availability metrics
- [ ] System health dashboard

**Files to implement:**
- `frontend/src/app/admin/analytics/page.tsx`
- `backend/src/services/analytics.service.ts`

**Success Criteria:**
- ✅ Admins can manage users/watchers
- ✅ Key metrics are visible
- ✅ System health is monitored

---

### Phase 8: Testing & Refinement (Week 11-12)
**Priority: High - Quality assurance**

#### 8.1 Testing
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Load testing
- [ ] WebRTC reliability testing

#### 8.2 UI/UX Polish
- [ ] Mobile responsiveness
- [ ] Accessibility (WCAG 2.1)
- [ ] Error states
- [ ] Loading states
- [ ] User feedback collection

#### 8.3 Documentation
- [ ] API documentation
- [ ] User guides
- [ ] Watcher training materials
- [ ] Deployment guide

**Success Criteria:**
- ✅ Core flows have >80% test coverage
- ✅ App is mobile-friendly
- ✅ Accessible to users with disabilities
- ✅ Documentation is complete

---

## Development Principles

### Code Quality Standards
1. **Type Safety**: No `any` types, strict TypeScript
2. **Error Handling**: Proper try/catch, user-friendly errors
3. **Validation**: Validate all inputs (client & server)
4. **Logging**: Structured logging (no PII)
5. **Comments**: Document complex logic only
6. **Testing**: Test critical paths as we build

### Architecture Guidelines
1. **Single Responsibility**: One function, one purpose
2. **DRY**: Don't repeat logic
3. **KISS**: Keep solutions simple
4. **Separation of Concerns**: Controllers → Services → Models
5. **Dependency Injection**: Pass dependencies, don't hardcode

### Privacy-First Checklist
- [ ] No call recording or storage
- [ ] Minimal data retention
- [ ] Anonymous mode support
- [ ] Encrypt sensitive data
- [ ] Clear data deletion policies
- [ ] Privacy-preserving analytics

### Performance Guidelines
- Optimize database queries (use indexes)
- Lazy load components
- Implement pagination
- Cache frequently accessed data (Redis)
- Monitor bundle size
- Use WebRTC directly (peer-to-peer)

---

## What to Build Next (Recommended Order)

### Immediate Next Steps:
1. **Database Models & Connection** (Phase 1.1) - 2-3 days
2. **Authentication System** (Phase 1.2) - 3-4 days
3. **User Profile Management** (Phase 1.3) - 2-3 days

### After Foundation:
4. **WebRTC Implementation** (Phase 2.1-2.2) - 5-7 days
5. **Call Interface** (Phase 2.3-2.4) - 3-4 days

### Then Critical Features:
6. **Emergency System** (Phase 3) - 4-5 days
7. **Watcher Onboarding** (Phase 4) - 5-7 days

---

## Technical Debt to Avoid

❌ **Don't:**
- Skip input validation
- Hardcode credentials
- Use `any` types
- Skip error handling
- Over-engineer early
- Add features not in plan

✅ **Do:**
- Write clean, readable code
- Add tests for critical paths
- Document complex logic
- Keep functions small
- Refactor as you go
- Ask before adding new dependencies

---

## Success Metrics (MVP Launch)

- [ ] Users can register and request watchers
- [ ] Watchers can accept and monitor calls
- [ ] Video/audio calls work reliably
- [ ] Emergency alerts trigger properly
- [ ] SMS integration works
- [ ] Anonymous mode functions
- [ ] System handles 10+ concurrent calls
- [ ] <2 second connection time
- [ ] 99% uptime

---

**Next Step**: Start with Phase 1.1 - Database Models & Connection
