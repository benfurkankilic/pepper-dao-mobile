# QA Checklist: Onboarding & Wallet Connection

## Test Environment Setup
- [ ] iOS device or simulator (iOS 13+)
- [ ] Android device or emulator (Android 5.0+)
- [ ] Wallet app installed (MetaMask, Trust Wallet, or similar)
- [ ] Clear app data before each test run for first-time user scenarios

## Pre-Test Setup Commands
```bash
# Clear storage and reset onboarding (for testing)
# You can add a debug button in settings to trigger these:
StorageService.remove(STORAGE_KEYS.ONBOARDING_COMPLETED);
StorageService.remove(STORAGE_KEYS.ONBOARDING_DISMISSED);
```

---

## Phase 1: Onboarding Wizard Tests

### Test 1.1: First Launch - Wizard Appears
**Steps:**
1. Fresh install or clear app data
2. Launch app
3. Wait for fonts to load

**Expected:**
- ✅ Loading spinner appears (white background, pink spinner)
- ✅ Onboarding wizard appears automatically
- ✅ Slide 1 visible: "Explore Freely" with 🎮 emoji
- ✅ Skip button visible in top-right
- ✅ Pagination dots show 1 of 3 (first dot filled)
- ✅ "Next →" button visible
- ✅ No "Back" button on first slide
- ✅ Light mode styling (white background, black text/borders)

### Test 1.2: Navigate Forward Through Slides
**Steps:**
1. On Slide 1, tap "Next →"
2. On Slide 2, tap "Next →"

**Expected:**
- ✅ Haptic feedback on each tap
- ✅ Slide 2 appears: "Vote & Govern" with 🗳️ emoji
- ✅ Pagination dots update (2nd dot filled)
- ✅ "Back" button now visible
- ✅ Slide 3 appears: "Earn Rewards" with 🏆 emoji
- ✅ Pagination dots update (3rd dot filled)
- ✅ Button text changes to "✓ Get Started"

### Test 1.3: Navigate Backward Through Slides
**Steps:**
1. Navigate to Slide 3
2. Tap "← Back"
3. Tap "← Back" again

**Expected:**
- ✅ Returns to Slide 2
- ✅ Returns to Slide 1
- ✅ "Back" button disappears on Slide 1
- ✅ Button text returns to "Next →"

### Test 1.4: Complete Onboarding
**Steps:**
1. Navigate to Slide 3
2. Tap "✓ Get Started"

**Expected:**
- ✅ Haptic feedback triggers
- ✅ Wizard disappears
- ✅ Wallet connection modal appears immediately
- ✅ Storage: `ONBOARDING_COMPLETED` = true
- ✅ Telemetry: `onboarding_completed` event fires

### Test 1.5: Skip Onboarding from Slide 2
**Steps:**
1. Fresh start, navigate to Slide 2
2. Tap "Skip" button

**Expected:**
- ✅ Haptic feedback triggers
- ✅ Wizard disappears
- ✅ Wallet connection modal appears immediately
- ✅ Storage: `ONBOARDING_COMPLETED` = true
- ✅ Telemetry: `onboarding_skipped` event fires with `skippedAtStep: 2`

### Test 1.6: Returning User - No Wizard
**Steps:**
1. Complete onboarding once
2. Close and reopen app

**Expected:**
- ✅ Wizard does NOT appear
- ✅ App goes straight to main content
- ✅ Wallet modal may appear if not dismissed

---

## Phase 2: Wallet Connection Modal Tests

### Test 2.1: Modal Appears After Onboarding
**Steps:**
1. Complete or skip onboarding wizard
2. Observe modal

**Expected:**
- ✅ Modal appears with dark overlay
- ✅ Title: "Connect Wallet"
- ✅ Description mentions governance, staking, rewards
- ✅ Primary button: "Connect Wallet" (pink with black border)
- ✅ Secondary button: "Explore Without Connecting" (outlined)
- ✅ Retro gaming design with chunky borders

### Test 2.2: Connect Wallet Flow
**Steps:**
1. Tap "Connect Wallet"
2. Select wallet from AppKit modal
3. Approve connection in wallet app

**Expected:**
- ✅ Haptic feedback on button tap
- ✅ Reown AppKit modal opens
- ✅ List of wallet options appears
- ✅ Can select and connect
- ✅ On success, wallet modal auto-dismisses
- ✅ Storage: session saved
- ✅ Telemetry: `wallet_connect_opened` and `wallet_connected` fire
- ✅ UI shows connected state with address

### Test 2.3: Explore Without Connecting
**Steps:**
1. From wallet modal, tap "Explore Without Connecting"

**Expected:**
- ✅ Haptic feedback triggers
- ✅ Modal closes
- ✅ Storage: `ONBOARDING_DISMISSED` = true
- ✅ App content visible in read-only mode
- ✅ Modal doesn't reappear on app restart

### Test 2.4: Modal Doesn't Show if Already Dismissed
**Steps:**
1. Tap "Explore Without Connecting"
2. Close and reopen app

**Expected:**
- ✅ Modal does NOT appear
- ✅ App goes straight to main content
- ✅ User can manually connect from settings/UI button

---

## Phase 3: Chain Guard Tests

### Test 3.1: Connect on Wrong Network
**Steps:**
1. Ensure wallet is on Polygon (137) or Ethereum (1)
2. Connect wallet
3. Try to execute a protected action (vote, stake)

**Expected:**
- ✅ Connection succeeds
- ✅ Network mismatch warning appears
- ✅ `wallet.isWrongNetwork` = true
- ✅ Protected actions blocked with `ProtectedActionError`
- ✅ Error reason: 'WRONG_NETWORK'
- ✅ Telemetry: `network_mismatch_shown` fires

### Test 3.2: Switch to Correct Network
**Steps:**
1. Connected on wrong network
2. Switch to Chiliz (88888) in wallet app
3. Return to Pepper DAO app

**Expected:**
- ✅ Warning disappears automatically
- ✅ `wallet.isWrongNetwork` = false
- ✅ Protected actions now allowed
- ✅ UI updates to show correct state

### Test 3.3: Connect on Chiliz from Start
**Steps:**
1. Ensure wallet is on Chiliz (88888)
2. Connect wallet

**Expected:**
- ✅ Connection succeeds
- ✅ No network warning appears
- ✅ Protected actions work immediately
- ✅ `wallet.chainId` = 88888

---

## Phase 4: Session Persistence Tests

### Test 4.1: Session Restores on App Restart
**Steps:**
1. Connect wallet on Chiliz
2. Close app completely
3. Reopen app

**Expected:**
- ✅ Connection restores automatically
- ✅ Address displayed immediately
- ✅ No need to reconnect
- ✅ Telemetry: `session_restored` fires
- ✅ Chain ID correct (88888)

### Test 4.2: Disconnect Wallet
**Steps:**
1. Connected state
2. Tap disconnect button (in settings or profile)

**Expected:**
- ✅ AppKit disconnects
- ✅ Storage cleared
- ✅ UI returns to disconnected state
- ✅ Telemetry: `wallet_disconnected` fires
- ✅ Cached data still visible (proposals, treasury)

### Test 4.3: Session Expired
**Steps:**
1. Connect wallet
2. Manually expire session in wallet app
3. Reopen Pepper DAO app

**Expected:**
- ✅ App detects expired session
- ✅ Returns to disconnected state
- ✅ Telemetry: `session_expired` fires
- ✅ User can reconnect manually

---

## Phase 5: Visual & Design Tests

### Test 5.1: Light Mode Styling
**Verify across all screens:**
- ✅ White backgrounds
- ✅ Black text and borders
- ✅ Vibrant accent colors (pink, blue, green)
- ✅ Black shadows (4px/8px offset, no blur)
- ✅ Sharp corners, no rounded edges
- ✅ Chunky 4px borders on buttons/cards

### Test 5.2: Typography
**Verify:**
- ✅ PPNeueBit-Bold for headings/buttons
- ✅ PPMondwest-Regular for body text
- ✅ Uppercase titles with generous letter-spacing
- ✅ Readable font sizes (not too small)

### Test 5.3: Button States
**Test all interactive elements:**
- ✅ Normal state: solid colors, thick borders, shadow
- ✅ Pressed state: shadow disappears, element translates
- ✅ Haptic feedback on all presses
- ✅ Touch targets ≥44px (iOS) / 48px (Android)

### Test 5.4: Safe Area Handling
**Test on devices with notches:**
- ✅ Skip button not obscured by notch
- ✅ Bottom navigation buttons clear of home indicator
- ✅ Content respects safe areas
- ✅ Status bar visible and styled correctly

---

## Phase 6: Telemetry Verification

### Check Console Logs for Events
**Onboarding:**
- ✅ `onboarding_started`
- ✅ `onboarding_step_viewed` (3 times with step: 1, 2, 3)
- ✅ `onboarding_completed` OR `onboarding_skipped`

**Wallet Connection:**
- ✅ `wallet_connect_opened`
- ✅ `wallet_connected` (with chainId and shortened address)
- ✅ `network_mismatch_shown` (if wrong network)
- ✅ `wallet_disconnected`

**Session:**
- ✅ `session_restored` (on app restart with valid session)
- ✅ `session_expired` (if session invalid)

---

## Phase 7: Edge Cases & Error Handling

### Test 7.1: No Wallet App Installed
**Steps:**
1. Tap "Connect Wallet"
2. No wallet apps detected

**Expected:**
- ✅ AppKit shows QR code option
- ✅ Or shows "Get a Wallet" option
- ✅ App doesn't crash

### Test 7.2: User Rejects Connection
**Steps:**
1. Tap "Connect Wallet"
2. Reject in wallet app

**Expected:**
- ✅ Modal remains open
- ✅ User can try again
- ✅ No error displayed (silent fail)

### Test 7.3: Network Timeout
**Steps:**
1. Disable network mid-connection

**Expected:**
- ✅ Graceful timeout
- ✅ Error message displayed
- ✅ User can retry

### Test 7.4: Multiple Rapid Taps
**Steps:**
1. Rapidly tap "Next" or "Connect Wallet"

**Expected:**
- ✅ Debounced correctly
- ✅ No duplicate actions
- ✅ No crashes

### Test 7.5: Background/Foreground
**Steps:**
1. During onboarding, background app
2. Return to app

**Expected:**
- ✅ State preserved
- ✅ Same slide visible
- ✅ No reset

---

## Phase 8: Platform-Specific Tests

### iOS-Specific
- ✅ Haptic feedback works correctly
- ✅ Safe area insets respected
- ✅ Status bar styling correct
- ✅ Wallet deep links work
- ✅ No layout issues on iPhone notched models
- ✅ Landscape orientation (if supported)

### Android-Specific
- ✅ Haptic feedback works correctly
- ✅ Back button behavior correct (doesn't skip onboarding)
- ✅ Status bar styling correct
- ✅ Wallet deep links work
- ✅ No layout issues on various screen sizes
- ✅ AppKit modal renders correctly (absolute positioning)

---

## Performance Checks

### Test P1: App Launch Time
- ✅ Fonts load quickly
- ✅ Loading spinner → onboarding < 2 seconds
- ✅ No visible jank or stuttering

### Test P2: Animation Smoothness
- ✅ Button press animations smooth
- ✅ Slide transitions instant (retro feel)
- ✅ Modal open/close smooth
- ✅ 60fps maintained

### Test P3: Memory Usage
- ✅ No memory leaks on repeated open/close
- ✅ AppKit cleans up properly on disconnect

---

## Accessibility Tests

### Test A1: Screen Reader Support
- ✅ Buttons have proper labels
- ✅ Slide content announced
- ✅ Navigation clear for blind users

### Test A2: Color Contrast
- ✅ Text readable on all backgrounds
- ✅ WCAG AA compliance (4.5:1 for body, 3:1 for large)

### Test A3: Touch Target Sizes
- ✅ All buttons ≥44x44px (iOS) / 48x48px (Android)
- ✅ Skip button large enough
- ✅ Easy thumb reach for primary actions

---

## Regression Tests

After any code changes, re-verify:
- ✅ First-time user flow (onboarding → wallet)
- ✅ Returning user flow (no onboarding)
- ✅ Connect/disconnect cycle
- ✅ Wrong network detection
- ✅ Session persistence

---

## Known Limitations (MVP)
- ❌ No multi-account switching UI
- ❌ No hardware wallet support
- ❌ No social login (disabled)
- ❌ No on-ramp features (disabled)
- ❌ No animated slide transitions (instant changes per retro design)

---

## Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**iOS Version:** _________________  
**Android Version:** _________________  
**Build:** _________________  

**Issues Found:** _________________  
**Blockers:** _________________  
**Ready for Release:** ☐ Yes ☐ No

