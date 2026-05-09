# Product Requirements Document: SignalSafe

## 1. Product Name and One-Line Summary
**SignalSafe**: A plain-language safety translator for suspicious official-looking messages, helping users identify scams and take safe next steps.

## 2. Problem Statement
Many scams are designed to mimic civic, legal, housing, or government communications. Users, especially those with lower digital literacy or navigating public systems under stress, often struggle to distinguish between legitimate urgent notices and malicious attempts to steal their data or money.

## 3. Target Users
- Older adults
- Immigrants and non-native speakers
- SNAP, Medicaid, and benefits recipients
- Job seekers in remote markets
- Renters navigating landlord communications
- People navigating public systems primarily via mobile phones

## 4. Prompt Alignment
**Prompt 3: AI translators for civic and legal documents.**
SignalSafe translates "legalistic" or "official" scam language into plain English and safety-checks the content to prevent harm.

## 5. User Needs and Pain Points
- **Fear/Urgency:** Scams use artificial urgency to force quick, unthinking actions.
- **Language Barriers:** Complex official language is hard to parse for non-native speakers.
- **Lack of Verification Knowledge:** Users don't always know how to find the real phone number for a bank or agency.
- **Connectivity Issues:** Users may lose internet access after receiving a message but need to know what to do.

## 6. Product Goals
- Provide immediate, low-stress analysis of suspicious messages.
- Translate complex legalese or scam-speak into 6th-grade level English.
- provide concrete, safe verification steps.
- works reliably on mobile with poor connectivity.

## 7. Non-Goals for the Hackathon MVP
- Full user accounts or personal profiles.
- Automated reporting to government agencies.
- Real-time connection to government databases.
- Definite "Proof" (AI provides "Likely Unsafe" judgments).
- Administrative dashboards.

## 8. Core MVP User Flow
1. **Input:** User pastes message text or uploads a screenshot.
2. **Analysis:** AI parses the message for risk factors and translates it.
3. **Report:** User sees risk level (Low/Medium/High) and a plain-language summary.
4. **Action:** User follows a "Safe Next Steps" checklist and uses a provided verification script.
5. **Persistence:** User can save the result locally for offline reference.

## 9. Functional Requirements
- **OCR Analysis:** Support for analyzing screenshots of SMS or emails.
- **Plain Language Translation:** Summarize the message intent in simple terms.
- **Risk Assessment:** Categorize suspicion level.
- **Verification Toolkit:** Generate scripts for calling official entities.
- **Demo Mode:** Pre-loaded examples for quick testing.

## 10. AI Behavior Requirements
- **Tone:** Calm, helpful, and objective.
- **Safety First:** Always lean towards caution (High risk if unsure).
- **No Legal Advice:** Include clear disclaimers that this is not legal or official advice.
- **Extraction:** Identify key entities (Company name, links, phone numbers) mentioned in the scam.

## 11. Output Schema
```json
{
  "riskLevel": "low" | "medium" | "high",
  "plainLanguageSummary": "string (6th grade level)",
  "whyThisMayBeUnsafe": "string",
  "suspiciousSigns": ["string"],
  "doNotDo": ["string"],
  "safeNextSteps": ["string"],
  "verificationScript": "string",
  "trustedVerificationAdvice": "string",
  "confidence": "number (0-1)",
  "disclaimer": "string"
}
```

## 12. UX Requirements
- **High Contrast:** Clear visibility for older adults.
- **Big Buttons:** Easy touch targets (min 44px).
- **Calm Colors:** Avoid panic-inducing flashing reds; use clear state indicators (Green/Yellow/Red).
- **Progress Indicators:** Show AI is working without being overwhelming.

## 13. Accessibility Requirements
- WCAG 2.1 AA compliance.
- Screen reader friendly.
- Font sizes scaling support.

## 14. Mobile and Spotty-Connectivity Requirements
- Single-page application logic to minimize reloads.
- Local storage persistence for analysis results.
- Optimized image uploads.

## 15. Privacy and Safety Requirements
- **Data Minimization:** No personal data stored on servers.
- **Transient Analysis:** Analyze and discard; no long-term logging of message content.

## 16. Abuse/Misuse Considerations
- AI should refuse to generate harmful content or assist in writing scams.
- Rate limiting for API calls.

## 17. Technical Architecture Recommendation
- **Frontend:** React + Tailwind CSS.
- **State Management:** React Hooks + LocalStorage.
- **AI Engine:** Google Gemini (Flash 1.5 for speed/multimodal).

## 18. Suggested Tech Stack
- Vite
- React
- Tailwind CSS
- Gemini API (@google/genai)
- Lucide React (Icons)
- Framer Motion (Transitions)

## 19. Two-Person Team Implementation Plan
- **Person A (Engine):** Gemini API integration, OCR logic, Prompt Engineering, Utility functions.
- **Person B (UI/UX):** Layout, Mobile responsiveness, Accessibility, Results visualization, Local persistence.

## 20. Hackathon Timeline
- **Fri 6PM:** Kickoff & Prompt Alignment.
- **Sat 10AM:** Brainstorming & PRD Finalization (Current State).
- **Sat 2PM:** Core Gemini API & OCR prototyping.
- **Sat 6PM:** UI/UX scaffolding.
- **Sun 10AM:** End-to-end integration.
- **Sun 4PM:** Demo Mode & LocalPersistence.
- **Mon 10AM:** Accessibility Audit & Polish.
- **Mon 4PM:** Recording Demo Video.
- **Mon 8PM:** Final Repo Cleanup & Submission Writeup.

## 21. Demo Video Plan (2 Minutes)
- **0:00-0:20:** The Problem (The "Urgent" Text Message).
- **0:20-0:50:** The Solution (SignalSafe Demo - Uploading the message).
- **0:50-1:30:** Deep Dive into Analysis (Risk level, Plain language, Script).
- **1:30-2:00:** The Impact & Path to Sustainability.

## 22. Brief Writeup Draft
- **Problem:** Scams look like official notices and exploit urgency.
- **Who it's for:** Vulnerable populations navigating civic systems.
- **Tools:** Gemini AI, React, Tailwind.
- **What's next:** Partnerships with housing authorities and senior centers.

## 23. Sustainability Path Through 2026
- Partner with Housing Authorities (e.g., NYCHA) to integrate as a tenant tool.
- Foundation funding from digital equity non-profits.
- White-label for banks to provide to low-literacy customers.

## 24. Measurable Impact Metrics
- Reduction in reported successful phishing scams among pilot users.
- User confidence score in identifying suspicious messages.

## 25. Risks and Mitigations
- **False Negative:** AI says it's safe when it isn't. (Mitigation: Always advise official verification).
- **Low Connectivity:** Analysis fails. (Mitigation: Saved results and clear error states).

## 26. Future Roadmap
- Multilingual support for Spanish, Mandarin, etc. (High Priority).
- Voice input for users who cannot type/read easily.
- Browser extension for email checks.

## 27. Acceptance Criteria/Checklist
- [ ] Public GitHub Repo.
- [ ] Working OCR/Text Analysis via Gemini.
- [ ] Plain Language Summary (Grade 6 level).
- [ ] Mobile-responsive layout.
- [ ] Demo Mode with 5 examples.
- [ ] "Save Result" working offline.
