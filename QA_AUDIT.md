# SignalSafe QA and Bug Audit

## 1. Accessibility QA Checklist
- [ ] **Screen Reader Navigation:** Test with VoiceOver/TalkBack. Does it announce "High Risk" immediately?
- [ ] **Keyboard Navigation:** Can we tab through all buttons? Are focus rings visible?
- [ ] **Focus States:** High contrast focus rings on blue buttons in dark mode.
- [ ] **Touch Targets:** Are all mobile buttons at least 44px?
- [ ] **Color Contrast:** Pass WCAG AAA in High Contrast mode?
- [ ] **Dark Mode:** Is text readable (white on dark slate)?
- [ ] **System Theme:** Does it update when changing OS settings (macOS/Android)?
- [ ] **Large Text:** Does text clip in the 340px mobile mockup?
- [ ] **Form Labels:** Are `textarea` components associated with clear labels or `aria-label`?
- [ ] **Risk Announcements:** Does `aria-live="polite"` trigger when analysis completes?
- [ ] **Read Aloud:** Does it stop correctly? Is the volume sufficient?
- [ ] **Spanish Mode:** Are all UI strings translated (Buttons, placeholders, settings)?
- [ ] **Reading Level:** Does the AI output shorter sentences in "Simple" mode?

## 2. Edge-Case Test Plan
- **Spanish Scam:** "Urgente: SNAP suspendido..." -> Spanish result.
- **Official Gov:** gov.uk link -> Low risk.
- **Blurry Shot:** AI should say "I couldn't read the image clearly" or give safe defaults.
- **SSN Request:** "Text asks for social security number." -> HIGH RISK.
- **Gift Cards:** "Pay with gift cards." -> HIGH RISK.
- **Connectivity:** Airplane mode after analysis -> Check if result is still viewable in History.
- **Theme Persistence:** Set to Dark + Extra Large + High Contrast -> Reload page.
- **System Theme:** Start in System (Light) -> Change OS to Dark -> App should flip instantly.

## 3. Implementation Risks & Fixes
- **Issue:** Focus rings invisible in dark mode.
  - **Severity:** High (Accessibility).
  - **Fix:** Use `focus:ring-offset-2 focus:ring-offset-slate-900 ring-blue-400`.
- **Issue:** Text Clipping in XL size.
  - **Severity:** Medium (UX).
  - **Fix:** Avoid fixed heights on containers holding AI text. Use `min-h` instead.
- **Issue:** AI returns English to a Spanish user.
  - **Severity:** Blocker (Functional).
  - **Fix:** Ensure `SYSTEM_PROMPT` enforces `OUTPUT LANGUAGE: Spanish` strictly.
- **Issue:** TTS reading icons.
  - **Severity:** Low.
  - **Fix:** Add `aria-hidden="true"` to all Lucide icons.

## 4. Final Submission Acceptance
- [ ] No API keys in public GitHub.
- [ ] Disclaimer present on results.
- [ ] No claims of "Detecting" or "Proving" scams.
- [ ] Demo Mode pre-loaded with examples.
- [ ] Mobile navigation works in 320px width.
