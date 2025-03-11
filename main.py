# search_essays.py
import faiss
import numpy as np
from pathlib import Path
import pickle
from openai import OpenAI  # for embeddings

class EssaySearch:
    def __init__(self):
        self.client = OpenAI(
            api_key='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'  # Replace with your actual API key
        )
        self.essays = {}  # Store essay content and metadata
        self.index = None  # FAISS index
        self.essay_ids = []  # To map FAISS indices back to essays
        
    def chunk_text(self, text, max_chars=4000):
        """Split text into chunks of max_chars"""
        # Split on paragraphs first
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) < max_chars:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
        
    def load_essays(self):
        """Load all essays from extracted directory"""
        extracted_dir = Path("extracted")
        for file_path in extracted_dir.glob("*.txt"):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Split content into chunks
                chunks = self.chunk_text(content)
                
                # Store each chunk as a separate document
                for i, chunk in enumerate(chunks):
                    chunk_id = f"{file_path.stem}_chunk_{i}"
                    self.essays[chunk_id] = {
                        'content': chunk,
                        'filename': file_path.name,
                        'title': file_path.stem,
                        'chunk_num': i
                    }

    def create_embeddings(self):
        """Create embeddings for all essay chunks"""
        embeddings = []
        self.essay_ids = []
        
        for essay_id, essay in self.essays.items():
            try:
                response = self.client.embeddings.create(
                    input=essay['content'],
                    model="text-embedding-3-small"
                )
                embedding = response.data[0].embedding
                embeddings.append(embedding)
                self.essay_ids.append(essay_id)
                print(f"Processed {essay_id}")
            except Exception as e:
                print(f"Error processing {essay_id}: {str(e)}")
                continue
            
        # Convert to numpy array
        embeddings_array = np.array(embeddings, dtype='float32')
        
        # Create FAISS index
        dimension = len(embeddings[0])
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings_array)
        
        # Save embeddings and index
        self.save_index()

    def save_index(self):
        """Save FAISS index and essay mappings"""
        faiss.write_index(self.index, "essay_index.faiss")
        with open("essay_mappings.pkl", "wb") as f:
            pickle.dump({
                'essay_ids': self.essay_ids,
                'essays': self.essays
            }, f)

    def load_index(self):
        """Load existing index and mappings"""
        self.index = faiss.read_index("essay_index.faiss")
        with open("essay_mappings.pkl", "rb") as f:
            data = pickle.load(f)
            self.essay_ids = data['essay_ids']
            self.essays = data['essays']

    def search(self, query, k=3):
        """Search for k most relevant chunks"""
        query_embedding = self.client.embeddings.create(
            input=query,
            model="text-embedding-3-small"
        ).data[0].embedding
        
        query_vector = np.array([query_embedding], dtype='float32')
        distances, indices = self.index.search(query_vector, k)
        
        results = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            essay_id = self.essay_ids[idx]
            results.append({
                'title': self.essays[essay_id]['title'],
                'filename': self.essays[essay_id]['filename'],
                'score': 1 / (1 + dist),
                'content': self.essays[essay_id]['content'][:200] + "...",
                'chunk_num': self.essays[essay_id]['chunk_num']
            })
            
        return results

# First time setup
searcher = EssaySearch()
searcher.load_essays()
searcher.create_embeddings()

# Later usage
# searcher = EssaySearch()
# searcher.load_index()

# Search
results = searcher.search("how do i be happy")
for r in results:
    print(f"\nTitle: {r['title']} (Chunk {r['chunk_num']})")
    print(f"Score: {r['score']:.3f}")
    print(f"Preview: {r['content']}")