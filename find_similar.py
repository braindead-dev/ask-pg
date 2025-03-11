from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

def load_essays():
    """Load all essays from the extracted directory"""
    essays = []
    filenames = []
    extracted_dir = Path("extracted")
    
    for file_path in extracted_dir.glob("*.txt"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
                essays.append(text)
                filenames.append(file_path.stem)
        except Exception as e:
            print(f"Error loading {file_path}: {str(e)}")
    
    return essays, filenames

def find_similar_essays(query):
    # Load essays and their filenames
    essays, filenames = load_essays()
    
    # Initialize the sentence transformer model
    model = SentenceTransformer('all-MPNet-base-v2')
    
    # Convert essays to embeddings
    print("Converting essays to embeddings...")
    essay_embeddings = model.encode(essays, convert_to_numpy=True)
    
    # Create FAISS index
    dimension = essay_embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(essay_embeddings)
    
    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    
    # Find top 3 similar essays
    k = 3
    distances, indices = index.search(query_embedding, k)
    
    # Print results
    print("\nTop 3 most similar essays:")
    for i, (idx, distance) in enumerate(zip(indices[0], distances[0])):
        print(f"\n{i+1}. {filenames[idx]}.txt (distance: {distance:.2f})")

if __name__ == "__main__":
    query = "how can i do great work / work hard?"
    find_similar_essays(query) 