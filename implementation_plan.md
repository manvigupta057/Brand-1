# Implementation Plan: Dynamic Prompt Routing (Semantic Match)

This document outlines how we will implement the **Cosine Similarity based Prompt Selection** system. This will allow the AI to automatically choose the best "Admin Instruction" based on what the user asks.

---

## 1. Core Architecture

### **A. Prompt Storage & Embedding**
- **File:** `backend/ai_setups.json` (Existing)
- **Change:** We will add a new field `"embedding": [...]` to each entry.
- **Process:** Whenever you save a prompt in the Admin Panel, the backend will immediately generate an embedding vector for that text using `all-MiniLM-L6-v2`.

### **B. Semantic Search (The "Logic")**
- **Target:** `backend/query_router.py` or a new `backend/prompt_matcher.py`.
- **Flow:** 
  1. User asks: *"What is the sentiment of Taj?"*
  2. Backend converts this query into a vector.
  3. Backend calculates **Cosine Similarity** between Query Vector and all stored Prompt Vectors.
  4. The prompt with the **highest score** is selected.

### **C. Superimposition (The "Injection")**
- **Target:** `backend/llm_interface.py`
- **Flow:** The selected prompt is injected as the **System Instruction** before calling Groq/LLM.

---

## 2. Step-by-Step implementation

### **Step 1: Embedding Service**
Update `backend/vector_store.py` to provide a clean `get_text_embedding(text)` function that we can reuse for both Brand Data and AI Prompts.

### **Step 2: Syncing Admin Panel with Embeddings**
Update `backend/main.py` CRUD endpoints:
- **POST/PUT `/api/ai-configs`**: When a prompt is saved, generate its embedding and save it to the JSON file.

### **Step 3: Cosine Similarity Logic**
Create `backend/similarity_utils.py` to handle the math:
```python
def get_best_match(query_vector, prompt_vectors):
    # Calculate cosine similarity using numpy or scipy
    # Return index of the best prompt
```

### **Step 4: Refactor Query Endpoint**
Update `backend/main.py` -> `query_endpoint`:
1. Get user query.
2. Fetch all active prompts from JSON.
3. Find best match using similarity.
4. Pass matched prompt to `generate_answer`.

---

## 3. User Review Required

> [!IMPORTANT]
> **Dynamic vs. Manual**: Do you want the system to *always* pick the best match, or should it ONLY pick from prompts that you have toggled as "Active" in the dashboard?

> [!TIP]
> **Fallbacks**: If no prompt matches well (Similarity < 0.4), we should use a "Default" general assistant prompt to ensure the bot doesn't behave weirdly.

---

## 4. Verification Plan
1. **Admin Test**: Create a "Medical" prompt and a "Brand" prompt.
2. **Chat Test 1**: Ask "What is blood pressure?" -> Should trigger Medical prompt.
3. **Chat Test 2**: Ask "Market share of Nike" -> Should trigger Brand prompt.
