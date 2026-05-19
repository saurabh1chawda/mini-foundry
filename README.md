# Mini-Foundry API Gateway

**Mini-Foundry** is an enterprise AI API gateway built to act as a unified proxy between internal developers and external LLMs. 

*This prototype was built to demonstrate architectural design, product execution, and MLOps governance principles for the Microsoft Foundry Senior PM (L63) role.*

## 🎯 The Problem
As enterprises adopt Generative AI, engineering teams face a "Shadow AI" crisis:
1. **Vendor Lock-in:** Developers hardcode specific provider SDKs (OpenAI, Anthropic), making migrations painful.
2. **Cost Blindness:** Platform Admins cannot attribute cloud AI spend to specific internal projects.
3. **Lack of Governance:** No centralized way to rate-limit rogue applications or enforce budgets before costs spiral.

## 💡 The Solution
Mini-Foundry centralizes AI traffic through a single FastAPI proxy, achieving:
*   **Zero Vendor Lock-in:** Developers code against one standard API (OpenAI spec); the backend routes to any model (OpenAI, Anthropic, Gemini).
*   **Total Cost Visibility:** Asynchronous telemetry tracking.
*   **Enterprise Governance:** Atomic token-bucket rate limiting via Redis.

## 🏗️ Architecture

Mini-Foundry decouples the *critical inference path* from the *observability path* to ensure <25ms latency overhead.

*   **Gateway:** `FastAPI` (Python)
*   **Routing Engine:** `LiteLLM`
*   **Rate Limiting:** `Redis` (Token Bucket)
*   **Telemetry (V2):** `PostgreSQL` via `Celery` workers.
*   **Frontend Dashboard:** React/Next.js (Mocked in `frontend/`)

Read the full [System Architecture Document](./docs/ARCHITECTURE.md).

## 📄 Product Requirements & Execution Trade-offs

This project is governed by a strict V1 PRD that outlines the compromises made to ship a resilient alpha prototype. 
**Key Product Decisions:**
*   **Zero-Payload Logging:** To comply with SOC2/PII constraints, the gateway *never* logs prompts or completions. It only logs metadata (tokens, latency).
*   **Pre-Stream Budget Checks:** To protect Developer UX, budgets are checked *before* an SSE stream begins. We absorb slight overages rather than severing a stream mid-generation and crashing client applications.
*   **V2 Scaling (Socket Exhaustion):** FastAPI workers will choke on thousands of long-lived SSE connections. The roadmap mandates placing Envoy or Kong in front of the Python workers for production scale.

Read the full [Product Requirements Document (PRD)](./docs/PRD.md).

## 🚀 Quickstart (Local Offline Development)

You can run a mock version of the Mini-Foundry gateway locally.

### 1. Setup Infrastructure
```bash
# Start the local Redis and Postgres instances
docker-compose up -d
```

### 2. Setup Gateway
```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt

# Copy the example environment file and add your keys
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Test Routing
Route to Anthropic using the standard OpenAI payload:
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mf_live_demo123" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "messages": [{"role": "user", "content": "Hello from Mini-Foundry!"}]
  }'
```

Read the full [Developer API Documentation](./docs/DEVELOPER_DOCS.md).