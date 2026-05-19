import os
import uuid
import time
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import litellm
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Mini-Foundry API Gateway")

# Mock Redis setup for the Token Bucket Rate Limiter
redis_client = None

@app.on_event("startup")
async def startup_event():
    global redis_client
    # Connect to the Redis instance defined in docker-compose
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[Dict[str, str]]
    stream: Optional[bool] = False
    temperature: Optional[float] = 1.0

async def verify_api_key_and_budget(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer mf_live_"):
        raise HTTPException(status_code=401, detail="Unauthorized. Invalid or missing Mini-Foundry API Key.")
    
    api_key = auth_header.split(" ")[1]
    
    # Pre-Stream Budget Check (Redis Token Bucket logic simulation)
    # In a real app, this would check `api_key` against a budget in Redis
    try:
        budget = await redis_client.get(f"budget:{api_key}")
        if budget and float(budget) <= 0:
             raise HTTPException(status_code=429, detail="Budget limit reached. Contact Platform Engineering.")
    except Exception as e:
        # Failsafe if redis is down
        pass
    
    return api_key

@app.post("/v1/chat/completions")
async def chat_completions(
    request: Request, 
    payload: ChatCompletionRequest, 
    api_key: str = Depends(verify_api_key_and_budget)
):
    trace_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        # Determine the correct API key based on the model
        if "gpt" in payload.model:
            provider_key = os.getenv("OPENAI_API_KEY")
        elif "gemini" in payload.model:
            provider_key = os.getenv("GEMINI_API_KEY")
        else:
            provider_key = os.getenv("ANTHROPIC_API_KEY")

        # Using LiteLLM to route the request exactly as requested by the developer
        response = await litellm.acompletion(
            model=payload.model,
            messages=payload.messages,
            stream=payload.stream,
            temperature=payload.temperature,
            api_key=provider_key
        )

        if payload.stream:
            # Handle Async Streaming & Tiktoken calculation (delegated to background worker in prod)
            async def stream_generator():
                async for chunk in response:
                    yield chunk
                # TODO: Trigger Celery worker here to calculate tokens via Tiktoken async
            
            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        
        else:
            # Synchronous response - parse tokens accurately
            latency = (time.time() - start_time) * 1000
            
            # TODO: Log metadata (not prompt/completion) to PostgreSQL asynchronously here
            # usage = response.usage
            
            return JSONResponse(
                content=response.model_dump(),
                headers={
                    "X-Mini-Foundry-Trace-Id": trace_id,
                    "X-Upstream-Provider-Status": "200 OK",
                    "X-Latency-Ms": f"{latency:.2f}"
                }
            )

    except Exception as e:
        raise HTTPException(
            status_code=502, 
            detail=str(e),
            headers={
                "X-Mini-Foundry-Trace-Id": trace_id,
                "X-Upstream-Provider-Status": "5xx Upstream Error"
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
