from transformers import pipeline

# Initialize the NLP model
classifier = pipeline("zero-shot-classification", model="MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli")

def analyze_lyrics(lyrics, query):
    try:
        # Perform zero-shot classification
        result = classifier(lyrics, candidate_labels=[query, "unrelated"], multi_label=False)
        
        # Print the result for debugging
        print(f"Classification result for query '{query}': {result}")
        
        # Check if the query is the top label AND the score is above a certain threshold
        is_relevant = result['labels'][0] == query and result['scores'][0] > 0.5
        
        print(f"Is relevant: {is_relevant}")
        
        return is_relevant
    except Exception as e:
        print(f"Error analyzing lyrics: {e}")
        return False