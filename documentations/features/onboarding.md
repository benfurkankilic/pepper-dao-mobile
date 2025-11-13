## Onboarding — Feature Specification

### Objective
Provide a smooth, beginner-friendly 3-slide wizard for first-time users to understand core app features before exploring or connecting a wallet.

### Scope
- 3-slide wizard showcasing key app features
- Skip button for users who want to skip onboarding
- Automatic transition to wallet connection modal after completion
- Storage persistence to prevent re-showing wizard
- Telemetry tracking for user flow analytics

### User Stories
- As a first-time user, I see a 3-slide wizard explaining what Pepper DAO offers.
- As a user, I can skip the wizard at any time via a Skip button.
- As a user who completes or skips onboarding, I immediately see the wallet connection modal.
- As a returning user, I don't see the onboarding wizard again.

### Slides Content

#### Slide 1: Explore Freely
- **Icon**: 🎮 (Gaming Controller)
- **Color**: Neon Green (#00FF80)
- **Title**: "Explore Freely"
- **Description**: "Browse proposals, check treasury stats, and discover the DAO feed. No wallet needed to explore!"
- **Purpose**: Highlight read-only browsing capabilities

#### Slide 2: Vote & Govern
- **Icon**: 🗳️ (Ballot Box)
- **Color**: Hot Pink (#FF006E)
- **Title**: "Vote & Govern"
- **Description**: "Connect your wallet to vote on proposals, stake PEPPER tokens, and participate in governance decisions."
- **Purpose**: Explain governance participation

#### Slide 3: Earn Rewards
- **Icon**: 🏆 (Trophy)
- **Color**: Electric Blue (#0080FF)
- **Title**: "Earn Rewards"
- **Description**: "Stake your tokens, participate actively, and earn rewards on Chiliz Chain (88888). Network guard keeps you safe!"
- **Purpose**: Showcase rewards and network safety

### Data Model
```ts
interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  shouldShowOnboarding: boolean;
}

interface SlideData {
  title: string;
  emoji: string;
  description: string;
  color: string;
}
```

### Storage Keys
- `STORAGE_KEYS.ONBOARDING_COMPLETED` - Boolean flag set when onboarding is finished or skipped

### UI Components

#### OnboardingWizard
- **Location**: `components/onboarding/onboarding-wizard.tsx`
- **Features**:
  - 3 full-screen slides
  - Skip button (top-right, always visible)
  - Pagination dots showing current step
  - Back button (hidden on first slide)
  - Next button (becomes "Get Started" on last slide)
  - Haptic feedback on all interactions
- **Design**: Retro gaming aesthetic with chunky borders, pixel fonts, bold colors

#### OnboardingGate
- **Location**: `components/onboarding/onboarding-gate.tsx`
- **Purpose**: Orchestrates onboarding flow
- **Logic**:
  1. Show loading spinner while checking storage
  2. If `shouldShowOnboarding === true` → render `OnboardingWizard`
  3. If onboarding completed → render app content with wallet modal overlay
- **No navigation**: Wizard replaces entire screen; app children stay mounted beneath

### Flows

#### 1. First App Launch (New User)
1. App loads → `OnboardingGate` checks storage
2. `ONBOARDING_COMPLETED` is `false` or missing
3. Render `OnboardingWizard` full-screen
4. User sees Slide 1 (Explore Freely)
5. Telemetry: `onboarding_started` and `onboarding_step_viewed` (step: 1)

#### 2. User Navigates Through Slides
1. User taps "Next" → Slide 2 (Vote & Govern)
2. Telemetry: `onboarding_step_viewed` (step: 2)
3. User taps "Back" → returns to Slide 1
4. User taps "Next" twice → reaches Slide 3 (Earn Rewards)
5. Telemetry: `onboarding_step_viewed` (step: 3)

#### 3. User Completes Onboarding
1. On Slide 3, user taps "Get Started"
2. `completeOnboarding('explore')` is called
3. `ONBOARDING_COMPLETED` set to `true` in storage
4. Telemetry: `onboarding_completed` (action: 'explore')
5. Wizard unmounts
6. App content renders with `WalletConnectionModal` overlay (if not dismissed)

#### 4. User Skips Onboarding
1. User taps "Skip" (available on any slide)
2. `completeOnboarding('explore')` is called
3. `ONBOARDING_COMPLETED` set to `true` in storage
4. Telemetry: `onboarding_skipped` (skippedAtStep: current step number)
5. Wizard unmounts
6. App content renders with `WalletConnectionModal` overlay (if not dismissed)

#### 5. Returning User
1. App loads → `OnboardingGate` checks storage
2. `ONBOARDING_COMPLETED` is `true`
3. Skip wizard; render app content directly
4. Wallet modal may appear if not connected and not dismissed

### Telemetry Events

#### `onboarding_started`
- **When**: Wizard mounts for the first time
- **Properties**: None
- **Purpose**: Track funnel start

#### `onboarding_step_viewed`
- **When**: User lands on a new slide (including initial slide)
- **Properties**:
  - `step` (number): 1, 2, or 3
  - `stepTitle` (string): Slide title (e.g., "Explore Freely")
- **Purpose**: Track engagement per slide

#### `onboarding_completed`
- **When**: User taps "Get Started" on final slide
- **Properties**:
  - `action` (string): 'explore' (always, for this flow)
- **Purpose**: Track successful completion

#### `onboarding_skipped`
- **When**: User taps "Skip" button
- **Properties**:
  - `skippedAtStep` (number): Which slide they skipped from
- **Purpose**: Measure skip rate and identify drop-off points

#### `onboarding_reset`
- **When**: Developer or user manually resets onboarding (testing/debug)
- **Properties**: None
- **Purpose**: Track manual resets for debugging

### Acceptance Criteria
- ✅ New users see 3-slide wizard on first app launch
- ✅ Skip button is visible on all slides and functional
- ✅ Back button is hidden on Slide 1, visible on Slides 2 & 3
- ✅ Next button becomes "Get Started" on Slide 3
- ✅ Pagination dots reflect current slide (filled/empty)
- ✅ Haptic feedback triggers on all button presses
- ✅ Completing or skipping sets `ONBOARDING_COMPLETED` flag
- ✅ Wizard never shows again after completion
- ✅ Wallet connection modal appears immediately after onboarding
- ✅ All telemetry events fire correctly
- ✅ Design follows retro gaming aesthetic (chunky borders, pixel fonts, bold colors)

### Design Specifications

#### Colors
- **Slide 1 Icon Background**: #00FF80 (Neon Green)
- **Slide 2 Icon Background**: #FF006E (Hot Pink)
- **Slide 3 Icon Background**: #0080FF (Electric Blue)
- **Screen Background**: #000000 (Black)
- **Text Primary**: #FFFFFF (White)
- **Text Secondary**: rgba(255, 255, 255, 0.9)
- **Borders**: #FFFFFF (White, 4px thick)
- **Button Active**: #FF006E (Hot Pink)
- **Button Inactive**: Transparent with white border

#### Typography
- **Title Font**: PPNeueBit-Bold
- **Body Font**: PPMondwest-Regular
- **Title Size**: 3xl (30px equivalent)
- **Body Size**: base (16px equivalent)
- **Letter Spacing**: wider (0.05em)
- **Text Transform**: uppercase (for titles and buttons)

#### Spacing
- **Screen Padding**: 24px (px-6)
- **Icon Box Padding**: 32px (p-8)
- **Icon Box Margin**: 32px bottom (mb-8)
- **Title Margin**: 24px bottom (mb-6)
- **Navigation Margin**: 48px bottom (pb-12)
- **Dot Gap**: 12px (gap-3)

#### Shadows
- **Icon Box**: 8px 8px 0px #000000
- **Buttons**: 4px 4px 0px #000000
- **Active State**: No shadow (translate by shadow offset)

#### Borders
- **Primary**: 4px solid white (border-4)
- **Secondary (Skip)**: 3px solid white/50 (border-3)
- **Style**: Sharp corners, no border-radius

### Error Handling
- If storage write fails, log error but continue (non-blocking)
- If telemetry fails, log error but don't interrupt flow
- Missing fonts: fallback to system fonts gracefully

### Performance
- Wizard is a single component, no lazy loading needed (small bundle)
- Haptic feedback is async and non-blocking
- Storage reads/writes are synchronous MMKV operations (fast)

### Tests (Manual QA)
- [ ] Launch app for first time → wizard appears
- [ ] Navigate forward through all 3 slides
- [ ] Navigate backward from Slide 2 to Slide 1
- [ ] Complete onboarding → wallet modal appears
- [ ] Skip onboarding from Slide 2 → wallet modal appears
- [ ] Close and reopen app → wizard doesn't appear
- [ ] Check telemetry logs for all events
- [ ] Verify haptic feedback on buttons (iOS/Android)
- [ ] Test on notched devices (safe area handling)

### Dependencies
- `expo-haptics` - Haptic feedback
- `react-native-mmkv` - Fast storage via `StorageService`
- `@/lib/telemetry` - Event tracking
- `@/contexts/onboarding-context` - State management
- `@/hooks/use-onboarding` - Onboarding logic hook

### Implementation Files
- `components/onboarding/onboarding-wizard.tsx` - Main wizard UI
- `components/onboarding/onboarding-gate.tsx` - Flow orchestration
- `contexts/onboarding-context.tsx` - React Context provider
- `hooks/use-onboarding.ts` - Onboarding state hook
- `lib/storage.ts` - Storage service and keys
- `lib/telemetry.ts` - Telemetry events

### Out of Scope (MVP)
- Animated transitions between slides (use instant changes for retro feel)
- Video or GIF content in slides
- Customizable slide content via remote config
- A/B testing different slide orders or content
- Gesture-based navigation (swipe to change slides)

### Future Enhancements
- Allow users to replay onboarding from settings
- Add more slides for advanced features (staking tutorial, governance deep-dive)
- Animated pixel art characters or mascots
- Localization support for multiple languages
- Analytics dashboard for onboarding funnel metrics

### Related Documentation
- **Wallet Connection**: See `wallet.md` for wallet connection modal spec
- **General Onboarding Flow**: See `wallet-and-onboarding.md` for combined overview

