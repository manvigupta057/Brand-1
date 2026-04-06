import os
from duckduckgo_search import DDGS

def search_web_knowledge(query: str, max_results: int = 3):
    print(f"Fetching real-time data for: {query}")
    results = []
    try:
        with DDGS() as ddgs:
            search_gen = ddgs.text(query, region='wt-wt', safesearch='off', timelimit='y')
            for i, result in enumerate(search_gen):
                if i >= max_results:
                    break
                results.append(f"Title: {result['title']}\n Snippet: {result['body']}")
        
        if not results:
            return "No real-time data found."
                
        return "\n\n".join(results) 
    except Exception as e:
        print(f"Search failed: {e}")
        return "No real-time data found."
    
if __name__ == "__main__":
    print(search_web_knowledge("NVIDIA brand performance 2024"))
                    