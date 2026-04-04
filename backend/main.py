import dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
import os
import json
import pandas as pd
import uuid
from datetime import datetime
import numpy as np
import mlflow
from dotenv import load_dotenv
from web_search import search_web_knowledge

# Import custom modules
from ai_config import load_configs, save_configs
from vector_store import get_embedding_model, search_similar
from llm_interface import generate_answer, generate_suggestions
from auth import router as auth_router
from query_router import route_query, parse_data_intent
from pandas_engine import execute_data_query

load_dotenv()
mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("Brand_Analyst_AI")

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
    history: list[dict] = []

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

class AISetup(BaseModel):
    name: str
    model: str
    prompt: str

# Standardize path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "brand_dataset.csv")

def calculate_cosine_similarity(v1, v2):
    v1, v2 = np.array(v1), np.array(v2)
    score = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    return float(score)

def resolve_query_context(query: str, history: list[dict]) -> str:
    # 🕵️ GREETING PROTECTION: Don't rewrite simple greetings
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "gm", "gn"]
    if query.strip().lower().rstrip('?').rstrip('!') in greetings:
        return query
        
    if not history:
        return query
        
    last_messages = history[-3:] 
    context_str = "\n".join([f"{m['role']}: {m['content'][:200]}..." for m in last_messages])
    
    prompt = f"""Conversation History:
    {context_str}
    
    User Query: "{query}"
    
    TASK: Decide if the User Query needs context from the History to be understood.
    
    RULES:
    1. If the User Query mentions a SPECIFIC BRAND (e.g., NVIDIA, Apple, ZenFoods, Zomato), DO NOT change it. Return it exactly as it is.
    2. ONLY rewrite if the query uses ambiguous words like 'it', 'its', 'them', 'that', 'the brand'.
    3. If you decide to rewrite, provide the full standalone question.
    4. Return ONLY the final text. No explanations.
    
    Final Response:"""
    
    from groq import Groq
    temp_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    try:
        response = temp_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        resolved = response.choices[0].message.content.strip().strip('"')
        print(f"[CONTEXT] Resolved '{query}' -> '{resolved}'")
        return resolved
    except:
        return query

@app.post("/query")
async def query_endpoint(request: QueryRequest):
    # Resolve context/pronouns first
    user_query = resolve_query_context(request.query, request.history)

    model = get_embedding_model()
    query_vector = model.encode(user_query).tolist()

    configs = load_configs()
    active_entry = next((c for c in configs if c.get("is_active")), None)
    instruction_to_use = active_entry["prompt"] if active_entry else "You are a Brand Analyst."

    # --- STRICT HYBRID LOGIC ---
    context_chunks, distances = search_similar(user_query, top_k=3)
    
    # 1. Stricter distance threshold
    is_poor_match = not distances or distances[0] > 1.0
    
    # 2. BRAND PROTECTION: Check if query contains brand names missing from local context
    potential_brands = [w.strip("?'\".,") for w in user_query.split() if w[0].isupper() and len(w) > 3]
    if potential_brands:
        brand_in_context = any(pb.lower() in " ".join(context_chunks).lower() for pb in potential_brands)
        if not brand_in_context:
            print(f"[HYBRID] Brand name '{potential_brands}' not found in local context. Forcing Web Search.")
            is_poor_match = True
    
    if is_poor_match:
        print(f"[HYBRID] Switching to Web Search... (Confidence: {distances[0] if distances else 'N/A'})")
        web_context = search_web_knowledge(user_query)
        context_chunks = [web_context]
    else:
        print(f"[HYBRID] Local match strong ({distances[0]}). Using ChromaDB.")

    llm_res = generate_answer(
        query=user_query,
        context_chunks=context_chunks,
        chat_history=request.history,
        system_instruction=instruction_to_use
    )
    answer = llm_res.get("answer", "I didn't quite get that.")
    
    # [TASK 4] Dynamic Suggestions (Chips)
    from llm_interface import generate_suggestions
    chips = generate_suggestions(answer)[:3]

    return {
        "query": user_query,
        "answer": answer,
        "suggestions": chips,
        "category": "BRAND_COACH",
        "user": "Auth User"
    }

    model = get_embedding_model()
    query_vector = model.encode(user_query).tolist()
    print(f"\nUser Question Embedding Generated! Size: {len(query_vector)}")
    print(f"[DEBUG] Vector preview: {query_vector[:3]}...") 
    
    # --- STEP 3: Persona Selection (Dashboard Priority) ---
    configs = load_configs()
    active_entry = next((c for c in configs if c.get("is_active")), None)
    
    # Use Dashboard Active Prompt as the Primary Identity
    primary_instruction = active_entry["prompt"] if active_entry else "You are a Brand Analyst."
    print(f"[AI ROUTER] Active Dashboard Persona: {active_entry.get('name') if active_entry else 'None'}")

    # --- STEP 4: Similarity Match (For special instructions) ---
    best_prompt = primary_instruction
    max_score = -1
    for config in [c for c in configs if c.get("embedding")]:
        score = calculate_cosine_similarity(query_vector, config["embedding"])
        if score > max_score:
            max_score = score
            if score > 0.6: # High threshold to switch persona dynamically
                best_prompt = config["prompt"]

    print(f"[AI ROUTER] Final Match Score: {max_score:.4f} | Using Persona: {best_prompt[:30]}...")

    # Step 5: Routing & Intelligence
    category = route_query(user_query)
    instruction_to_use = best_prompt
    
    if category == "DATA":
        answer = execute_data_query(user_query)
        no_data_phrases = ["sorry", "not found", "didn't find", "empty", "no data", "unavailable", "don't have"]
        if any(phrase in answer.lower() for phrase in no_data_phrases):
            print(f"[AI FALLBACK] Pandas missing data. Switching to Semantic Mode.")
            category = "SEMANTIC (Fallback)"
            context_chunks, distances = search_similar(user_query, top_k=3)
            llm_res = generate_answer(user_query, context_chunks, system_instruction=instruction_to_use)
            answer = llm_res.get("answer", answer)
    else:
        context_chunks, distances = search_similar(user_query, top_k=3)
        is_poor_match = not distances or distances[0] > 1.2

        if is_poor_match:
            print(f"Local match poor. Switching to Web Search...")
            web_context = search_web_knowledge(user_query)
            context_chunks = [web_context] 
        else:
            print(f"Local match strong ({distances[0]}). Using ChromaDB.")

        llm_res = generate_answer(user_query, context_chunks, system_instruction=instruction_to_use)
        answer= llm_res.get("answer", "I didn't quite get that.")

    return {
        "query": user_query,
        "answer": answer,
        "category": category,
        "user": "Demo User"
    }

@app.post("/suggestions")
async def suggestions_endpoint(request: SuggestionRequest):
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
    if brand_name in df["brand_name"].values:
        idx = df[df["brand_name"] == brand_name].index[0]
        df.at[idx, "type_of_brand"] = updated_data.type_of_brand
        df.at[idx, "market_share"] = updated_data.market_share
        df.at[idx, "seo_score"] = updated_data.seo_score
        df.at[idx, "sentiment_score"] = updated_data.sentiment_score
        df.at[idx, "years_in_market"] = updated_data.years_in_market
        df.at[idx, "audience_reach"] = updated_data.audience_reach
        df.at[idx, "reviews"] = updated_data.reviews
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
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(CSV_PATH, index=False)
    return {"status": "Success", "message": f"Brand {brand.brand_name} added!"}

@app.get("/api/brands")
def get_brands(page: int = 1, limit: int = 10, search: str = ""):
    try:
        df = pd.read_csv(CSV_PATH)
        if search:
            search = search.strip()
            df = df[df["brand_name"].astype(str).str.contains(search, case=False, na=False)]
        total = int(len(df))
        start = (page - 1) * limit
        data = df.iloc[start:start+limit].to_dict(orient="records")
        return {"total": total, "page": page, "data": data}
    except Exception as e:
        return {"total": 0, "page": page, "data": [], "error": str(e)}

@app.get("/health")
def health():
    return {"status": "Backend running"}

@app.get("/api/ai-configs")
def get_ai_configs():
    return load_configs()

@app.post("/api/ai-configs")
def create_ai_config(setup: AISetup):
    configs = load_configs()
    model = get_embedding_model()
    prompt_vector = model.encode(setup.prompt).tolist()
    new_entry = {
        "id": str(uuid.uuid4()),
        "name": setup.name,
        "model": setup.model,
        "prompt": setup.prompt,
        "embedding": prompt_vector,
        "is_active": False,
        "created_at": datetime.now().isoformat()
    }
    configs.append(new_entry)
    save_configs(configs)
    return new_entry

@app.put("/api/ai-configs/{config_id}")
def update_ai_config(config_id: str, setup: AISetup):
    configs = load_configs()
    model =  get_embedding_model()
    prompt_vector = model.encode(setup.prompt).tolist()
    for c in configs:
        if c["id"] == config_id:
            c["name"] = setup.name
            c["model"] = setup.model
            c["prompt"] = setup.prompt
            c["embedding"] = prompt_vector
    save_configs(configs)
    return {"status": "Updated"}

@app.delete("/api/ai-configs/{config_id}")
def delete_ai_config(config_id: str):
    configs = load_configs()
    configs = [c for c in configs if c["id"] != config_id]
    save_configs(configs)
    return {"status": "Deleted"}

@app.patch("/api/ai-configs/{config_id}/activate")
def activate_ai_config(config_id: str):
    configs = load_configs()
    for c in configs:
        c["is_active"] = (c["id"] == config_id)
    save_configs(configs)
    return {"status": "Activated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)