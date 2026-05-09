<div align="center">
<img width="1200" height="475" alt="SignalSafe Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SignalSafe

SignalSafe helps people check suspicious official-looking messages before they click, pay, or share personal information.

## Suggested GitHub Repo Description

Primary: Plain-language safety translator for suspicious official-looking messages.

Alternative: Helps users check suspicious benefits, job, housing, and civic messages before they click, pay, or share personal information.

## Prompt Chosen

Prompt 3: AI translators for civic and legal documents.

SignalSafe aligns with this prompt through scam prevention. Many scams imitate civic, benefits, housing, legal, employment, financial, or government communications. SignalSafe translates those messages into plain language, helps identify warning signs, and gives safe next steps to verify through official channels.

## Problem

People receive urgent official-looking texts, emails, screenshots, job offers, landlord messages, benefits warnings, debt notices, and government-looking communications. These messages can be confusing and high-pressure. For vulnerable users, one wrong click may lead to stolen money, identity theft, fake job fraud, lost benefits access, or unsafe sharing of personal information.

SignalSafe does not claim to prove whether a message is real or fake. It is designed to help users slow down, review warning signs, and verify safely.

## Target Users

- older adults
- immigrants
- benefits recipients
- job seekers
- renters
- low-digital-literacy users
- people navigating public systems from their phone

## What It Does

Users paste text or upload a screenshot of a suspicious message. SignalSafe returns:

- Low / Medium / High risk level
- plain-language explanation
- suspicious warning signs
- what not to do
- three safe next steps
- verification script
- trusted verification advice
- saved/shareable safety checklist

## Accessibility & Inclusion

SignalSafe is an accessibility-conscious MVP designed to better support non-native English speakers, older adults, low-vision users, and people with lower digital literacy.

Current accessibility and inclusion features include:

- Spanish language support
- simple-language mode
- larger text
- high contrast
- light/dark/system appearance
- browser read-aloud support
- local saved settings/results for spotty connectivity

## Demo

- Hosted prototype: TODO
- Demo video: TODO
- Optional AI marketing video: TODO

## Tech Stack

- Google AI Studio
- Gemini
- React
- TypeScript
- Vite
- Tailwind CSS
- Web Speech API
- LocalStorage
- Claude Code / Codex / other tools: TODO if used

## Running Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local`.
4. Add your Gemini API key to `.env.local` as `GEMINI_API_KEY`.
5. Start the development server:
   ```bash
   npm run dev
   ```

Never commit `.env.local` or API keys.

## Environment Variables

```env
GEMINI_API_KEY=
```

API keys and secrets must stay out of the public repo.

## Sustainability

SignalSafe should remain free for individual users. The sustainability path is institutional partnership with libraries, senior centers, workforce development programs, benefits navigators, municipalities, banks/credit unions, and digital-literacy nonprofits.

Possible funding paths include:

- digital equity grants
- fraud-prevention grants
- foundation-funded pilots
- institution-funded deployments

## Measurable Impact

- suspicious messages checked
- users who avoid clicking unsafe links
- users who know how to verify through official channels
- saved/shared safety checklists
- partner-reported avoided scams
- digital-literacy workshop usage

## Safety & Limitations

- SignalSafe does not prove whether something is real or fake.
- It helps identify warning signs.
- Users should verify through official websites, phone numbers, agencies, employers, landlords, banks, or trusted organizations.
- It is not legal, financial, medical, or official government advice.
- Users should not share passwords, SSNs, banking information, or payment until they verify through trusted channels.

## Next Steps

- strengthen server-side API key handling if needed
- expand language support
- improve screenshot OCR/image analysis reliability
- add partner resource links
- run pilots with libraries/senior centers/workforce programs
- collect user feedback from target population

Hosted prototype: <link>
Demo video: <link>
Optional AI marketing video: <link>