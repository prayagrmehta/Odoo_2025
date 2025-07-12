import openai

# 🔑 Replace this with your real OpenRouter API key
openai.api_key = "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" 
openai.api_base = "https://openrouter.ai/api/v1"

prompt = "Write a friendly message asking someone to swap Python skills for UI/UX design help."


response = openai.ChatCompletion.create(
    model="mistralai/mistral-7b-instruct",  # or try "meta-llama/llama-3-8b-instruct"
    messages=[
        {"role": "system", "content": "You write short, polite skill-swap messages."},
        {"role": "user", "content": prompt}
    ]
)


print("\n🔹 AI Generated Message:\n")
print(response["choices"][0]["message"]["content"].strip())
