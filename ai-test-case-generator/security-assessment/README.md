# Security Assessment: Safe Exam Browser (SEB) Integration

> This documents the methodology and findings from a security assessment of Safe Exam Browser integration. The actual exploit code is not included — only the approach, findings, and recommendations.

---

## Context

Safe Exam Browser (SEB) is an open-source browser lockdown application used for proctored online examinations. When our company was integrating SEB for online exams, I was asked to assess its security before production deployment.

## Approach

Instead of surface-level testing (checking if the browser locks down properly), I took an adversarial approach:

1. **Source Code Analysis** — Used AI (Claude) to analyze SEB's open-source C# codebase and identify all security control implementations
2. **Architecture Review** — Mapped how the client communicates with the server, what gets validated where, and what doesn't
3. **Proof-of-Concept Generation** — AI was able to generate a working IL patcher (using Mono.Cecil) in under 10 minutes that could bypass security controls

## Key Finding: Architecture-Level Gap

The critical discovery was not a bug in a single function — it was an **architecture-level design flaw**:

> **The SEB server never validates the integrity of the client binary.**

SEB relies on a Browser Exam Key (BEK) — a hash of the application binary — to prove the client is unmodified. However, when we analyzed the protocol, we found that the server had no mechanism to independently verify whether the client reporting the BEK was actually running genuine, unmodified SEB code.

This means:
- A modified SEB client can report the correct BEK while having all security controls disabled
- All client-side protections (VM detection, remote desktop detection, screen capture blocking, keyboard hook prevention) become advisory — they can be patched out
- The server has no way to detect this

## Security Controls Assessed

| Control | Purpose | Bypassable? |
|---------|---------|-------------|
| Virtual Machine Detection | Prevents running SEB in VMs | Yes — detection logic is client-side only |
| Remote Desktop Detection | Prevents screen sharing via RDP | Yes — detection runs locally, can be disabled |
| Integrity Verification | Ensures SEB binary is unmodified | Yes — BEK can be recalculated after patching |
| Screen Capture Blocking | Prevents screenshots during exams | Yes — hook can be removed |
| Keyboard Hook Prevention | Prevents Alt+Tab and similar | Yes — hook is client-side |
| Process Monitoring | Detects unauthorized processes | Yes — monitoring runs locally |
| Browser Lockdown | Restricts navigation | Yes — can be disabled in patched binary |

**7 out of 7 client-side security controls** were bypassable because none had server-side verification.

## Impact Classification

| Severity | Finding |
|----------|---------|
| **P0 — Critical** | Server does not validate client binary integrity |
| **P1 — High** | All security controls are client-side only, no server-side enforcement |
| **P2 — Medium** | BEK recalculation allows modified binaries to appear genuine |
| **P3 — Low** | Detection mechanisms use easily spoofable system calls |

## Recommendations Delivered

1. **Server-side binary attestation** — Implement remote attestation so the server can independently verify client integrity
2. **Behavioral analysis** — Monitor exam-taking patterns (timing, input patterns) for anomalies that suggest a modified client
3. **Network-level validation** — Verify that client requests match expected SEB behavior at the network protocol level
4. **Defense in depth** — Don't rely solely on client-side controls for security-critical operations

## Outcome

- Findings were documented in a complete security audit report with severity classification
- Recommendations were prioritized into the development roadmap
- The vulnerability was caught **before production deployment**

## Lesson Learned

**Client-side security is advisory, not enforced.** For any security-critical system (exams, payments, authentication), the server must be the authority. If you trust the client to report its own integrity, a determined adversary will always find a way around it.

AI dramatically accelerated this assessment — what might have taken days of manual code review was accomplished in hours through AI-assisted source code analysis and proof-of-concept generation.
