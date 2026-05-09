# Accessibility and Language Support Plan: SignalSafe

## 1. Accessibility Risk Assessment
- **Critical (MVP):**
    - **Language Barrier:** Users receiving scams in Spanish or preferring Spanish instructions.
    - **Vision Impairment:** Low contrast or small text making it impossible for older adults to read "Safe Next Steps".
    - **OCR Failure:** Blurry screenshots leading to incorrect AI analysis (need clear error states).
    - **Screen Reader Support:** Buttons without labels or non-semantic HTML preventing blind users from using the app.
- **Wait until post-hackathon:**
    - Full Multilingual Support (beyond Spanish).
    - Braille integration.
    - Specialized hardware support.

## 2. Recommended MVP Accessibility Features
- **Language Toggle:** English/Spanish output.
- **Reading Level Adjustment:** Force AI to 4th-6th grade reading level.
- **Visual Controls:** Simple High Contrast and Text Size scaling.
- **Text-to-Speech (TTS):** Browser-based read-aloud for the summary and next steps.
- **Semantic HTML:** Ensure `button`, `main`, `nav`, and `h1-h3` tags are used correctly.

## 3. Recommended Settings Screen
- **Language:** English / Español
- **Instructions:** "Simpler language" (Toggle)
- **Display:** "Large Text" (Toggle), "High Contrast" (Toggle)
- **Audio:** "Read Result Aloud" (Toggle)
- **Result Style:** "Quick Safety Checklist" / "Full Explanation"

## 4. UX Copy for Settings
- "How do you want to use SignalSafe?"
- "Language: Choose your preferred language for the safety report."
- "Easy Reading: Use simpler words and shorter sentences."
- "Text Size: Make words larger and easier to see."
- "Read to Me: Automatically read the safety steps out loud."

## 5. Technical Implementation Plan
- **Storage:** Use `localStorage` to save user preferences across sessions.
- **AI Integration:** Pass the `UserPreferences` object into the Gemini system prompt.
- **TTS:** Use the `window.speechSynthesis` API for zero-cost, offline-friendly read-aloud.
- **Styling:** Use a top-level CSS class on the root element (e.g., `.theme-high-contrast`, `.text-lg`) to adjust Tailwind constants.
- **Semantic HTML:** Use `aria-live="polite"` for the loading/analysis state to announce progress to screen readers.

## 6. AI Prompt Changes
- **Update:** Prepend user preferences to the prompt:
- "Output Language: [Language]"
- "Target Reading Level: [Grade Level]"
- "Format: [Checklist Only / Detailed]"
- **Safety First:** Maintain the "Likely Unsafe" language and "Verify through official channels" mandate regardless of settings.

## 7. Output Schema Changes
No structural changes needed to the JSON schema, but the *content* within the strings will vary based on prompt instructions.

## 8. Acceptance Criteria
- [ ] User can switch to Spanish and receive a Spanish report.
- [ ] Large Text mode increases font sizes globally.
- [ ] High Contrast mode passes WCAG AAA contrast ratios.
- [ ] Text-to-Speech works on mobile browsers.
- [ ] Screen reader correctly reads the Risk Level when a result appears.

## 9. Edge-Case Test Cases
- **Spanish Scam:** "Urgente: Su cuenta de SNAP..." -> Result should be in Spanish.
- **Safe Gov Link:** gov.uk or .gov link -> Result: Low Risk.
- **Blurry Image:** Analysis should return a graceful "Cannot read image" message or safe general advice.
- **High Contrast:** Verify all button text is readable with high contrast on.

## 10. Demo Video Segment (10-15s)
Show a user clicking "Español" and "Large Text" in settings, then scanning a Spanish message, highlighting the app's inclusivity.
