# 📄 Product Requirements Document: Mini-Foundry (Final V3)
**Document Owner:** Saurabh Chawda 
**Target Release:** V1 (Prototype)

## 1. Executive Summary
"Mini-Foundry" is an enterprise AI API gateway that acts as a unified proxy between internal developers and external LLMs. It achieves zero vendor lock-in, provides total cost visibility, and enforces enterprise governance—without reading proprietary prompt data or degrading developer velocity.

## 2. Target Personas & RBAC
*   **Platform Admin (Sam):** *Admin View:* Org costs, Token Heuristics, Global key revocation.
*   **App Developer (Alex):** *Developer View:* "My Keys, My Code Snippets, My Filterable Logs."

## 3. Scope & Infrastructure Constraints (V1)
*   **Scale:** ~500 Requests Per Minute (RPM).
*   **Architecture:** Single-Region, Multi-Availability Zone (Multi-AZ) deployment. 
*   **Zero-Payload Logging:** Strictly no storage of `messages` (prompts) or `completions` (outputs). Metadata only.

## 4. Functional Requirements
### Epic 1: The Unified Gateway & Routing
*   **Story 1.1:** Developers use standard OpenAI SDKs by changing their `base_url`.
*   **Story 1.2:** The Gateway utilizes `LiteLLM` to map payloads 1:1 strictly.
*   **Story 1.3 (Streaming):** `stream=True` requests pass through as SSE streams. Token counts are aggregated asynchronously post-stream using `Tiktoken`.

### Epic 2: Observability & Developer UX
*   **Story 2.1:** Every response header includes `X-Mini-Foundry-Trace-Id` and `X-Upstream-Provider-Status`.
*   **Story 2.2:** Developers can access a "Request Logs" dashboard with 1-click filters.

### Epic 3: Governance & Admin UX
*   **Story 3.1:** Admins can enforce hard token budgets ($50 default). Evaluated *pre-stream* via Redis Token Bucket.
*   **Story 3.2:** Rejections return human-readable JSON: `{"error": "Budget limit reached. Contact Platform Engineering."}`
*   **Story 3.3 (Optimization Insights):** The Admin Dashboard flags inefficient model usage based on token heuristics. **Crucially, insights are only displayed if estimated savings exceed $500/month** to prevent alert fatigue.

## 5. Metrics for Success
*   **🌟 North Star:** **W4 Retention of Internal App IDs** (Target: >90%).
*   **📈 Supporting:** Time-to-Hello-World (< 2 mins).
*   **🛡️ Guardrail:** Proxy Uptime (99.9%), Gateway Latency Overhead (< 25ms).

## 6. V2 Scaling Roadmap (Identified post-Alpha)
*   **Socket Exhaustion Mitigation:** To handle thousands of long-lived SSE streaming connections, V2 will introduce an infrastructure-level API Gateway (e.g., **Envoy** or **Kong**) in front of the FastAPI application to offload TCP connection management from the Python worker threads.