# 📄 Product Requirements Document: Mini-Foundry (V1 Prototype)
**Document Owner:** Saurabh Chawda, Senior Product Manager
**Target Release:** V1 (Alpha)
**Methodology:** STEP Framework (Clarifying Questions, Goal, Users, Pain Points, Solutions, Prioritization, Metrics)

---

## 1. Clarifying Questions & Scope (S - Scope)
Before defining the solution, we established the following constraints and scope for this prototype:
*   **Which company are we building for?** An enterprise-scale organization managing multiple internal engineering teams building Generative AI features.
*   **What are the technical constraints?** The solution must not require developers to learn a new SDK. It must be a drop-in infrastructure layer.
*   **What is the platform ecosystem?** Developers are primarily using the OpenAI SDK natively (Python/Node). We must integrate seamlessly into this existing behavior.
*   **Are we targeting a specific audience?** Internal B2B. Specifically, the engineering and platform teams within the enterprise.
*   **Scale (Alpha Rollout):** Designed to handle ~500 Requests Per Minute (RPM) at peak, supporting 3-5 internal engineering squads.

---

## 2. GOAL (T - Target/Goal)
**The overarching objective:** To provide a unified LLM routing and observability layer that eliminates vendor lock-in and controls cloud costs, **without degrading developer velocity or introducing a Single Point of Failure (SPOF).**

By centralizing AI traffic, we aim to transition the enterprise from "Shadow AI" (fragmented, unmonitored API usage) to Governed AI.

---

## 3. Users (E - Evaluate Personas)
**Brainstormed Segments:** App Developers, Platform/MLOps Admins, FinOps, Security.

**Selected Primary Persona:** **Platform / MLOps Admin (Sam)**
*Rationale:* While developers are the *users* of the API, Platform Admins are the *buyers and enforcers* of infrastructure tooling. If we solve Sam's governance problem without causing friction for the App Developers (Alex), we achieve enterprise-wide adoption.

**Role-Based Access Control (RBAC) Views:**
*   **Platform Admin (Sam):** *Admin View:* Org costs, Token Heuristics, Global key revocation.
*   **App Developer (Alex):** *Developer View:* "My Keys, My Code Snippets, My Filterable Logs."

---

## 4. Pain Points (P - Pain Points)
Focusing on Sam (Platform Admin), we identified the following critical pain points:
1.  **Cost Blindness & Attribution:** Cannot attribute the monthly $50k AI bill to specific internal projects or developers.
2.  **Lack of Governance & Rate Limiting:** No way to rate-limit or cut off an internal app stuck in an infinite LLM loop.
3.  **Vendor Lock-in (Secondary Developer Pain):** Forcing teams to migrate from OpenAI to a cheaper model requires weeks of code rewrites across the organization.

---

## 5. Solutions & Features (S - Solutions)

### Epic 1: The Unified Gateway & Routing (Engineering Focus)
*   **Story 1.1:** Developers use standard OpenAI SDKs by changing their `base_url`.
*   **Story 1.2 (Strict 1:1 Routing):** The Gateway utilizes `LiteLLM` to map payloads strictly to the requested upstream model (e.g., Anthropic, Gemini, OpenAI). No "secret" auto-downgrading of models.
*   **Story 1.3 (Streaming & Token Accuracy):** `stream=True` requests pass through as SSE streams. Token counts are aggregated asynchronously post-stream using `Tiktoken` to ensure the UX is not blocked while maintaining accurate billing.

### Epic 2: Observability & Developer UX (Data Focus)
*   **Story 2.1 (Debugging Transparency):** Every response header includes `X-Mini-Foundry-Trace-Id` and `X-Upstream-Provider-Status`.
*   **Story 2.2:** Developers can access a "Request Logs" dashboard with 1-click filters for `[2xx Success]`, `[4xx Gateway Rate Limits]`, and `[5xx Upstream Errors]`.

### Epic 3: Governance & Admin UX (Platform Focus)
*   **Story 3.1 (Pre-Stream Budgets):** Admins can enforce hard token budgets ($50 default). Budgets are evaluated *pre-stream* via a local Redis Token Bucket to prevent cutting off active completions mid-generation.
*   **Story 3.2:** Rejections return human-readable JSON: `{"error": "Budget limit reached. Contact Platform Engineering."}`
*   **Story 3.3 (Optimization Insights):** The Admin Dashboard analyzes **Metadata Heuristics** (e.g., high prompt-to-completion token ratios) to flag inefficient usage patterns. **Crucially, insights are only displayed if estimated savings exceed $500/month** to prevent alert fatigue.

---

## 6. Non-Functional & Architecture Constraints (Prioritization)
*   **Architecture (Uptime vs. Cost):** Single-Region, Multi-Availability Zone (Multi-AZ) deployment. Ensures 99.9% uptime while keeping cloud compute costs minimal and avoiding distributed Redis state-sync issues.
*   **Zero-Payload Logging Policy:** The gateway will **never** store the `messages` (prompts) or the `completions` (outputs). Only metadata (token counts, latency, model ID) is retained to mitigate PII/SOC2 risks.
*   **Overhead Latency:** Gateway processing must add **< 25ms** of latency to the LLM round-trip.

---

## 7. Metrics for Success (M - Metrics)
*   **🌟 North Star:** **W4 Retention of Internal App IDs** (Target: >90%). Do apps continue to route through us 4 weeks after onboarding?
*   **📈 Supporting:** Time-to-Hello-World (< 2 mins).
*   **🛡️ Guardrail:** Proxy Uptime (99.9%), Gateway Latency Overhead (< 25ms).

---

## 8. V2 Scaling Roadmap (Identified Post-Alpha)
*   **Socket Exhaustion Mitigation:** To handle thousands of long-lived SSE streaming connections, V2 will introduce an infrastructure-level API Gateway (e.g., **Envoy** or **Kong**) in front of the FastAPI application. This offloads TCP connection management from the Python worker threads, preventing synchronous thread exhaustion.