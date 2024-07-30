from transformers import pipeline

# Initialize the NLP model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def analyze_lyrics(lyrics, query):
    try:
        result = classifier(lyrics, candidate_labels=[query, "unrelated"])
        return result['labels'][0] == query
    except Exception as e:
        print(f"Error analyzing lyrics: {e}")
        return False