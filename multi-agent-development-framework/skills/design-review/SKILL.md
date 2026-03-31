---
name: design-review
description: "Design audit scoring 7 dimensions 0-10. Detects AI slop. Fixes obvious gaps. Inspired by gstack /design-review and /plan-design-review."
origin: MADF+gstack
---

# Design Review — Visual Quality Audit

Rate design quality across 7 dimensions. Detect AI-generated visual patterns. Fix what's fixable, escalate what needs taste.

## When to Use

- **Pre-implementation** (Phase 3): After UX_SPEC.md is written, before building
- **Post-implementation** (Phase 4b): After frontend is built, before G4/G5
- After any significant UI changes
- When something "looks off" but you can't pinpoint why

## The 7 Design Dimensions

Score each dimension 0-10. For any score below 7, explain what a 10 looks like.

| # | Dimension | What to Evaluate |
|---|-----------|-----------------|
| 1 | **Information Architecture** | Is the content hierarchy clear? Can users find what they need? Is navigation logical? |
| 2 | **Interaction Design** | Are all states handled (loading, error, empty, success)? Are interactions intuitive? Feedback on every action? |
| 3 | **Visual Hierarchy** | Does the eye know where to go? Is there a clear primary action per screen? Typography scale consistent? |
| 4 | **Consistency** | Same patterns for same actions? Colors, spacing, typography used consistently? Design system alignment? |
| 5 | **Responsive Design** | Does it work at 375px, 768px, 1280px? Is it mobile-first? Does content reflow properly? |
| 6 | **Accessibility** | WCAG 2.1 AA: color contrast (4.5:1), keyboard navigation, focus indicators, screen reader support, semantic HTML? |
| 7 | **AI Slop Score** | Does the design look AI-generated? (See detection checklist below) |

## AI Slop Detection Checklist

AI-generated designs have telltale patterns. Check for:

- [ ] **Gradient abuse** — unnecessary gradients on backgrounds, cards, or buttons
- [ ] **Icon overload** — every list item has a decorative icon with no information value
- [ ] **Card grid pattern** — everything is in equal-sized cards in a grid, regardless of content type
- [ ] **Generic stock imagery** — abstract blob illustrations or gradient meshes
- [ ] **Excessive whitespace with no hierarchy** — spacious but directionless
- [ ] **Drop shadows everywhere** — every element has a shadow, even where depth doesn't help
- [ ] **Rainbow color palette** — too many colors with no clear brand system
- [ ] **Button inflation** — multiple equally-prominent CTAs competing for attention
- [ ] **Typography monotony** — same font size/weight for different content types
- [ ] **Decorative borders/dividers** — visual noise that doesn't aid comprehension

**AI Slop Score**:
- 10/10 = Intentional, human-crafted design decisions throughout
- 7-9/10 = Minor AI patterns, easily fixable
- 4-6/10 = Significant AI slop — needs design rework
- 0-3/10 = Obviously AI-generated — start over with design constraints

## The Audit Process

### Pre-Implementation Review (Phase 3)

Read `artifacts/UX_SPEC.md` and evaluate:

1. Score each dimension 0-10
2. For scores < 7: describe what a 10 looks like
3. Flag AI slop patterns found
4. Suggest specific improvements (not vague "make it better")
5. **Interactive**: For each taste decision, ask the user. Don't auto-resolve aesthetic choices.

Output: Updated UX_SPEC.md with design review annotations.

### Post-Implementation Review (Phase 4b)

Open the app in a browser and evaluate:

1. Score each dimension 0-10 against actual rendered UI
2. Compare with UX_SPEC.md — flag deviations
3. For CSS-only fixes: auto-apply with atomic commits
4. For structural/JSX changes: propose the change, ask before applying
5. Screenshot before/after for each fix

**Fix Budget**: Maximum 30 fixes per review. If more are needed, the design needs rework, not patching.

**Safety**: One commit per fix. CSS changes auto-approved. JSX/structural changes count toward a risk budget and need explicit approval.

## Scoring Output Format

```markdown
# Design Review — [Date]

## Overall Score: [X]/70 ([X/7 average]/10)

| # | Dimension | Score | Notes |
|---|-----------|-------|-------|
| 1 | Information Architecture | 8/10 | Clear hierarchy, logical navigation |
| 2 | Interaction Design | 6/10 | Missing error states on 3 forms |
| 3 | Visual Hierarchy | 7/10 | Good primary actions, weak secondary |
| 4 | Consistency | 9/10 | Strong design system adherence |
| 5 | Responsive Design | 5/10 | Breaks at 375px — card grid overflows |
| 6 | Accessibility | 4/10 | Missing focus indicators, low contrast |
| 7 | AI Slop Score | 7/10 | Minor gradient abuse on header |

## Findings
[Detailed findings per dimension with fix recommendations]

## Fixes Applied
[List of atomic commits with before/after descriptions]

## Escalated to User
[Taste decisions that need human judgment]
```

## Integration with MADF

| MADF Phase | Design Review Use |
|-----------|-------------------|
| Phase 3 (UX) | Pre-implementation audit of UX_SPEC.md |
| Phase 4b (Frontend) | Post-implementation visual audit |
| G4 Gate | No dimension below 5/10. AI Slop Score ≥ 7/10. |
| G5 Gate | Average score ≥ 7/10 across all dimensions. |
