# Mini-Foundry API Documentation

Welcome to Mini-Foundry! Our API is designed to be a drop-in replacement for the OpenAI SDK. You can route to OpenAI, Anthropic, or local models just by changing your API key and Base URL.

## 🚀 Quickstart (Python)

You do **not** need a new SDK. Just use the standard OpenAI package.

### Option A: Use the Production Gateway
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.minifoundry.internal/v1",
    api_key="mf_live_demo123" 
)
```

### Option B: Local / Offline Development
If you are working remotely or off the corporate VPN, you can run a local instance of Mini-Foundry that mocks the gateway.
1. Download the `docker-compose.yml` from this repository.
2. Run `docker-compose up -d` in your terminal.
3. Point your code to localhost:
```python
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="mf_live_demo123" 
)
```

## 🛑 Error Codes
| Status Code | Description | Developer Action |
| :--- | :--- | :--- |
| **401** | Unauthorized | Your Mini-Foundry key is invalid or revoked. |
| **429** | Rate Limited | Budget Exceeded. Contact Platform Engineering. |
| **502** | Bad Gateway | Upstream provider is down. |