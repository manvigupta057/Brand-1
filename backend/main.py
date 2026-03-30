from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
import os
import pandas as pd

# Standardize path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "brand_dataset.csv")

from vector_store import search_similar
from llm_interface import generate_answer, generate_suggestions
from auth import router as auth_router
from query_router import route_query, parse_data_intent
from pandas_engine import execute_data_query

# app must be defined FIRST before any @app decorators
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

class BrandData(BaseModel):
    brand_name: str
    type_of_brand: str
    market_share: float
    seo_score: int
    sentiment_score: float = 0.0
    years_in_market: int = 1
    audience_reach: int = 0
    reviews: int = 0

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

# Admin & Brand APIs
@app.get("/api/stats")
def get_stats():
    df = pd.read_csv(CSV_PATH)
    return {
        "total_brands": int(len(df)),
        "avg_seo": round(float(df["seo_score"].mean()), 2),
        "avg_sentiment": round(float(df["sentiment_score"].mean()), 2),
        "avg_market_share": round(float(df["market_share"].mean()), 2)
    }

@app.delete("/api/brands/{brand_name}")
def delete_brand(brand_name: str):
    df = pd.read_csv(CSV_PATH)
    df = df[df["brand_name"] != brand_name] 
    df.to_csv(CSV_PATH, index=False) 
    return {"status": "Brand deleted successfully"}

@app.put("/api/brands/{brand_name}")
def update_brand(brand_name: str, updated_data: BrandData):
    df = pd.read_csv(CSV_PATH)
    # Check if brand exists
    if brand_name in df["brand_name"].values:
        # Update the row. We find the index where brand_name matches.
        idx = df[df["brand_name"] == brand_name].index[0]
        
        # Mapping updated_data to the dataframe row
        df.at[idx, "type_of_brand"] = updated_data.type_of_brand
        df.at[idx, "market_share"] = updated_data.market_share
        df.at[idx, "seo_score"] = updated_data.seo_score
        df.at[idx, "sentiment_score"] = updated_data.sentiment_score
        df.at[idx, "years_in_market"] = updated_data.years_in_market
        df.at[idx, "audience_reach"] = updated_data.audience_reach
        df.at[idx, "reviews"] = updated_data.reviews
        
        # If the user also wants to change the name (optional, but handled here)
        if updated_data.brand_name != brand_name:
            df.at[idx, "brand_name"] = updated_data.brand_name
            
        df.to_csv(CSV_PATH, index=False)
        return {"status": "Success", "message": f"Brand {brand_name} updated!"}
    else:
        return {"status": "Error", "message": "Brand not found"}, 404

@app.post("/api/brands")
def add_brand(brand: BrandData):
    df = pd.read_csv(CSV_PATH)
    new_row = {
        "brand_name": brand.brand_name,
        "years_in_market": brand.years_in_market,
        "audience_reach": brand.audience_reach,
        "market_share": brand.market_share,
        "type_of_brand": brand.type_of_brand,
        "reviews": brand.reviews,
        "sentiment_score": brand.sentiment_score,
        "seo_score": brand.seo_score
    }
    # Nayi row ko dataframe mein add karein
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(CSV_PATH, index=False)
    return {"status": "Success", "message": f"Brand {brand.brand_name} added!"}

@app.get("/api/brands")
def get_brands(page: int = 1, limit: int = 10, search: str = ""):
    try:
        # Debug logging to help identify which file is being used
        print(f"LOADING DATA FROM: {CSV_PATH}")
        df = pd.read_csv(CSV_PATH)
        print(f"LOADED {len(df)} RECORDS")

        if search:
            search = search.strip()
            # Ensure brand_name is treated as string to avoid errors with NaN or numbers
            df = df[df["brand_name"].astype(str).str.contains(search, case=False, na=False)]
        
        total = int(len(df))
        start = (page - 1) * limit
        data = df.iloc[start:start+limit].to_dict(orient="records")
        return {"total": total, "page": page, "data": data}
    except Exception as e:
        print(f"ERROR IN get_brands: {str(e)}")
        return {"total": 0, "page": page, "data": [], "error": str(e)}

@app.get("/health")
def health():
    return {"status": "Backend running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
