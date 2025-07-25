# Project TODOs

## Landing Page

- [ ] Create a new landing page route
- [ ] Design basic landing layout with hero section, project title, and tagline
- [ ] Add navigation links (login, signup, main app features)
- [ ] Add call-to-action button (start/join session or sign up)
- [ ] Add responsive styles for mobile and desktop

---

## DB Logic

- [ ] Define new Prisma models if needed (e.g., Feedback, LandingPageStats) in `server/prisma/schema.prisma`
- [ ] Generate and run migrations (`npx prisma migrate dev`)
- [ ] Create API endpoint for landing page stats in `server/src/index.ts`
- [ ] Implement DB logic for user registration in `server/src/index.ts`
- [ ] Add DB logic for session creation/joining

---

## Input Validations

- [ ] Add frontend validation for forms (login, signup, session join) using `zod` or `yup`
- [ ] Add backend validation for API endpoints
- [ ] Show validation errors in UI (display error messages below inputs)

---

## UI Changes

- [ ] Update navigation bar with links to landing page and main sections
- [ ] Improve session join/create UI (input fields, validation, feedback)
- [ ] Add loading and error states (spinners, error messages for async actions)
- [ ] Polish user feedback (toasts, modals for success/error notifications)
- [ ] Test and refine mobile responsiveness

---

## General

- [ ] Write unit tests for new logic (validation functions, API endpoints)
- [ ] Update README with new features and endpoints

---
