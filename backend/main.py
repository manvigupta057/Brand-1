from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
import os
import pandas as pd

from vector_store import search_similar
from llm_interface import generate_answer, generate_suggestions
from auth import router as auth_router
from query_router import route_query, parse_data_intent
from pandas_engine import execute_data_query

# ✅ app must be defined FIRST before any @app decorators
app = FastAPI(title="Brand Analyst AI API")

# Middleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "fallback-secret"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

class QueryRequest(BaseModel):
    query: str

class SuggestionRequest(BaseModel):
    text: str

@app.post("/query")
async def query_endpoint(request: QueryRequest):
    query = request.query
    category = route_query(query)

    if category == "DATA":
        answer = execute_data_query(query)
    else:
        context_chunks = search_similar(query, top_k=5)
        llm_res = generate_answer(query, context_chunks)
        answer = llm_res.get("answer", "I couldn't find a specific answer in the archives.")

    return {
        "query": query,
        "answer": answer,
        "category": category,
        "user": "Demo User"
    }

@app.post("/suggestions")
async def suggestions_endpoint(request: SuggestionRequest):
    """Returns suggestions."""
    suggestions = generate_suggestions(request.text)
    return {"suggestions": suggestions}

# ✅ Admin & Brand APIs
@app.get("/api/stats")
def get_stats():
    df = pd.read_csv("brand_dataset.csv")
    return {
        "total_brands": int(len(df)),
        "avg_seo": round(float(df["seo_score"].mean()), 2),
        "avg_sentiment": round(float(df["sentiment_score"].mean()), 2),
        "avg_market_share": round(float(df["market_share"].mean()), 2)
    }

@app.get("/api/brands")
def get_brands(page: int = 1, limit: int = 10, search: str = ""):
    df = pd.read_csv("brand_dataset.csv")
    if search:
        df = df[df["brand_name"].str.contains(search, case=False, na=False)]
    total = int(len(df))
    start = (page - 1) * limit
    data = df.iloc[start:start+limit].to_dict(orient="records")
    return {"total": total, "page": page, "data": data}

@app.get("/health")
def health():
    return {"status": "Backend running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
