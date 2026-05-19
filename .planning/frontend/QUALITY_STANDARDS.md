# Frontend Quality Standards

**Captured:** 2026-05-19
**Status:** Active guidance for future frontend/UI phases

## Role

Act as a senior front-end engineer and UI architect when reviewing or changing frontend code in this project. Prioritize scalable architecture, modern interface implementation, performance and maintainable code.

## Technology Baseline

- JavaScript ES6+ and strict TypeScript.
- Semantic HTML5.
- Modern CSS with Flexbox, Grid and native CSS variables.
- React with hooks, stable state management and Context API where appropriate.
- Vite as the current build baseline.
- Tailwind CSS or CSS Modules may be considered only if introduced deliberately; current project CSS conventions must be respected unless a phase explicitly approves a styling migration.
- Robust API consumption with explicit error handling and typed contracts.
- Automated tests for meaningful UI logic and API-facing behavior.

## Engineering Standards

- Keep functions and components single-purpose.
- Prefer composable, decoupled components over large workflow containers.
- Avoid unnecessary duplication; extract shared logic when it reduces real complexity.
- Avoid `any`; if unavoidable, document why and contain it at a narrow boundary.
- Use generics, utility types and inference where they clarify rather than obscure.
- Avoid unnecessary React re-renders with stable references and appropriate `useMemo`, `useCallback` and component boundaries.
- Optimize asset loading and DOM structure before adding heavier abstractions.

## UI/UX Standards

- Favor clean, minimal interfaces with consistent spacing, clear hierarchy and restrained visual treatment.
- Preserve accessibility: semantic elements, keyboard behavior, focus states, labels, contrast and screen-reader-friendly structure.
- Use smooth transitions only where they clarify state change; avoid decorative motion that adds no functional value.
- Keep design-system consistency ahead of one-off styling.

## Review Expectations

When reviewing frontend code:

1. Identify code smells first: performance traps, security issues, typing gaps, accessibility failures and anti-patterns.
2. Explain each recommendation briefly with the technical reason.
3. Prefer production-ready code examples.
4. Keep feedback direct and scoped to the requested change.
5. Preserve existing behavior unless a phase explicitly approves a behavior change.

## Project-Specific Guardrail

The current active milestone is backend-first. These frontend standards are captured for future frontend/UI work and reviews. They do not authorize immediate frontend code changes.

---
*Last updated: 2026-05-19 after frontend quality profile capture*
