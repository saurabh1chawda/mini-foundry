### System Architecture Overview
The system is designed for **high throughput and low latency**. The critical path (Developer -> Gateway -> LLM) is strictly separated from the observability path (Telemetry -> Database).

```mermaid
graph TD
    Client["App Developer (OpenAI SDK)"]
    Gateway["FastAPI Gateway (Python)"]
    Redis["Redis (Auth & Token Bucket)"]
    Router["LiteLLM Router Engine"]
    BackgroundQueue["Celery Worker (Async Tiktoken)"]
    Postgres["PostgreSQL (Telemetry DB)"]
    
    Client -- "POST /v1/chat/completions" --> Gateway
    Gateway -- "1. Pre-Stream Budget Check" --> Redis
    Gateway -- "2. Normalize Payload" --> Router
    Router -- "3. HTTP Request" --> Upstream_LLMs
    
    Router -. "4. Enqueue Stream Data" .-> BackgroundQueue
    BackgroundQueue -. "5. Async Token Math & Insert" .-> Postgres
```

### Core Components
1. **FastAPI:** Handles thousands of concurrent I/O requests.
2. **Redis (Single Primary):** Low-latency layer for atomic Token Bucket rate-limiting.
3. **PostgreSQL:** Time-scale partitioned metadata logging.