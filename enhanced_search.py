from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from openai import OpenAI
import os
import tiktoken
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_title(text):
    """Extract the title from the essay text"""
    match = re.match(r'^(.*?)\n---', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None

def get_source_link(filename):
    """Generate the source link for an essay"""
    return f"https://paulgraham.com/{filename}.html"

def load_essays():
    """Load all essays from the extracted directory"""
    essays = []
    filenames = []
    titles = []
    extracted_dir = Path("extracted")
    
    for file_path in extracted_dir.glob("*.txt"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
                title = extract_title(text)
                if title:
                    essays.append(text)
                    filenames.append(file_path.stem)
                    titles.append(title)
        except Exception as e:
            print(f"Error loading {file_path}: {str(e)}")
    
    return essays, filenames, titles

def summarize_with_llm(text, prompt, max_tokens=300):
    """Generate a summary using OpenAI's API"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # or another appropriate model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes Paul Graham's essays into key points and quotes. Focus on the main things PG is trying to say / give advice on. Prioritize direct advice / what PG would've said if he had to summarize his own text."},
                {"role": "user", "content": f"{prompt}\n\n{text}"}
            ],
            max_tokens=max_tokens,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        # Return a truncated version as fallback
        return text[:max_tokens*4] + "... [truncated due to summarization error]"

def count_tokens(text):
    """Count tokens in a text string"""
    encoding = tiktoken.encoding_for_model("gpt-4")
    return len(encoding.encode(text))

def chunk_text(text, chunk_size=500, overlap=50):
    """Split text into chunks of approximately chunk_size tokens with overlap"""
    encoding = tiktoken.encoding_for_model("gpt-4")
    tokens = encoding.encode(text)
    chunks = []
    
    i = 0
    while i < len(tokens):
        # Get chunk of tokens
        chunk_tokens = tokens[i:i + chunk_size]
        # Decode back to text
        chunk = encoding.decode(chunk_tokens)
        chunks.append(chunk)
        # Move forward with overlap
        i += (chunk_size - overlap)
    
    return chunks

def find_and_process_essays(query):
    # Load essays and their metadata
    essays, filenames, titles = load_essays()
    
    # Initialize the sentence transformer model
    model = SentenceTransformer('all-MPNet-base-v2')
    
    # Convert essays to embeddings for initial ranking
    print("Finding top essays...")
    essay_embeddings = model.encode(essays, convert_to_numpy=True)
    
    # Create FAISS index for essays
    dimension = essay_embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(essay_embeddings)
    
    # Encode query
    query_embedding = model.encode([query], convert_to_numpy=True)
    
    # Find top 3 similar essays
    k = 3
    distances, indices = index.search(query_embedding, k)
    
    # Get the top essays with all metadata
    top_essays = [essays[idx] for idx in indices[0]]
    top_filenames = [filenames[idx] for idx in indices[0]]
    top_titles = [titles[idx] for idx in indices[0]]
    top_links = [get_source_link(filename) for filename in top_filenames]
    
    print("\nTop 3 most similar essays:")
    for i, (title, link, distance) in enumerate(zip(top_titles, top_links, distances[0])):
        print(f"{i+1}. {title} ({link}) (distance: {distance:.2f})")
    
    # Step 2: Chunk and rank
    print("\nChunking essays and ranking chunks...")
    chunks = []
    chunk_sources = []
    
    for i, essay in enumerate(top_essays):
        essay_chunks = chunk_text(essay, chunk_size=500, overlap=50)
        print(f"Essay {i+1} ({top_titles[i]}) split into {len(essay_chunks)} chunks")
        
        for j, chunk in enumerate(essay_chunks):
            chunks.append(chunk)
            chunk_sources.append(f"{top_titles[i]} ({top_links[i]}, Chunk {j+1})")
    
    # Encode and rank chunks
    chunk_embeddings = model.encode(chunks, convert_to_numpy=True)
    chunk_index = faiss.IndexFlatL2(dimension)
    chunk_index.add(chunk_embeddings)
    
    # Find top chunks
    num_chunks = min(5, len(chunks))  # Get top 5 chunks or all if less than 5
    chunk_distances, chunk_indices = chunk_index.search(query_embedding, num_chunks)
    
    top_chunks = [chunks[idx] for idx in chunk_indices[0]]
    top_sources = [chunk_sources[idx] for idx in chunk_indices[0]]
    
    print("\nTop chunks selected:")
    for i, (source, distance) in enumerate(zip(top_sources, chunk_distances[0])):
        tokens = count_tokens(top_chunks[i])
        print(f"{i+1}. {source} (distance: {distance:.2f}, tokens: {tokens})")
    
    # Step 3: Summarize top chunks
    print("\nSummarizing top chunks...")
    # Format each chunk with its full source info
    top_chunks_text = "\n\n---\n\n".join([
        f"From \"{source.split(' (')[0]}\" ({source.split(' (')[1]}:\n{chunk}" 
        for source, chunk in zip(top_sources, top_chunks)
    ])
    
    summary_prompt = f"Summarize into 300-400 words, make sure to focus on stuff relevant to the user prompt: '{query}'."
    tight_context = summarize_with_llm(top_chunks_text, summary_prompt, max_tokens=400)
    
    # Step 4: Prepend source info with clear titles
    sources_with_titles = [f"\"{source.split(' (')[0]}\" ({source.split(' (')[1]}" 
                          for source in top_sources]
    sources_text = ",\n".join(sources_with_titles)
    final_context = f"""Sources:
    {sources_text}

    Summary: {tight_context}"""
    
    # Create the final prompt for an LLM
    final_prompt = f"""{final_context}

Query: {query}

Instructions: You are Paul Graham, founder of Y Combinator and essayist. Answer the query based on the provided summary, which cites your essays as context to help answer the query as authentically as possible. Cite sources using essay titles and links when appropriate (e.g., 'which I talked about in "{top_titles[0]}"...'). Provide an authentically PG response, in your style and they way you'd answer the query."""
    
    print("\nFinal context created!")
    print(f"Total tokens in final context: {count_tokens(final_context)}")
    print("\nReady for LLM processing. Here's the final context:")
    print("-" * 80)
    print(final_context)
    print("-" * 80)
    
    return final_prompt

if __name__ == "__main__":
    query = "how can i do great work / work hard?"
    final_prompt = find_and_process_essays(query)
    # For now, just print the prompt that would be sent to the LLM
    print("\nThis prompt would be sent to the LLM:")
    print("-" * 80)
    print(final_prompt) 