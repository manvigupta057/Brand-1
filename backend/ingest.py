import pandas as pd
import os
import shutil
import chromadb
from sentence_transformers import SentenceTransformer
from config import Config

# 1. Configuration
CSV_FILE_PATH = Config.CSV_PATH
DB_PATH = Config.CHROMA_DB_DIR
COLLECTION_NAME = Config.COLLECTION_NAME

print("Loading Embedding Model...")
embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)

def ingest_data():
    if not os.path.exists(CSV_FILE_PATH):
        print(f"Error: Could not find dataset at {CSV_FILE_PATH}")
        return

    print(f"Reading News Data from {CSV_FILE_PATH}...")
    df = pd.read_csv(CSV_FILE_PATH)
    
    documents = []
    metadata = []
    ids = []

    print("Processing Rows into Text Chunks...")
    for index, row in df.iterrows():
        # Create a descriptive text chunk for the vector database
        brand = str(row.get('brand_name', ''))
        industry = str(row.get('type_of_brand', ''))
        share = str(row.get('market_share', ''))
        reach = str(row.get('audience_reach', ''))
        years = str(row.get('years_in_market', ''))
        reviews = str(row.get('reviews', ''))
        sentiment = str(row.get('sentiment_score', ''))
        seo = str(row.get('seo_score', ''))
        
        combined_text = (
            f"Brand: {brand}. Industry: {industry}. Market Share: {share}%. "
            f"Years in Market: {years}. Audience Reach: {reach}. "
            f"Reviews Rating: {reviews}/5. Sentiment Score: {sentiment}. SEO Score: {seo}."
        )
        
        documents.append(combined_text)
        metadata.append({
            "brand_name": brand,
            "type_of_brand": industry,
            "row_index": index
        })
        ids.append(f"brand_{index}")

    print("Initializing ChromaDB...")
    if os.path.exists(DB_PATH):
        try:
            shutil.rmtree(DB_PATH)
        except Exception as e:
            print(f"Warning: Could not delete old DB folder: {e}")
            
    client = chromadb.PersistentClient(path=DB_PATH)
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    print(f"Generating Embeddings for {len(documents)} rows (This might take a while)...")
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        end_idx = min(i + batch_size, len(documents))
        
        batch_docs = documents[i:end_idx]
        batch_ids = ids[i:end_idx]
        batch_meta = metadata[i:end_idx]
        
        embeddings = embedding_model.encode(batch_docs).tolist()
        
        collection.add(
            documents=batch_docs,
            embeddings=embeddings,
            metadatas=batch_meta,
            ids=batch_ids
        )
        print(f"Processed {end_idx}/{len(documents)} rows...")

    print("✅ Ingestion Complete! Data saved to ChromaDB locally.")

if __name__ == "__main__":
    ingest_data()
