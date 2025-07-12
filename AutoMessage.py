import openai

# 🔑 Paste your OpenRouter API key here
openai.api_key = "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"  # Replace this
openai.api_base = "https://openrouter.ai/api/v1"

# ✅ Function to generate skill-swap message
def generate_swap_message(profile, model="mistralai/mistral-7b-instruct"):
    messages = [
        {
            "role": "system",
            "content": "You are helping users write personalized skill-swap request messages. Be polite, match the tone, and keep it short."
        },
        {
            "role": "user",
            "content": f"""
Name: {profile['name']}
Rating: {profile['rating']}
Bio: {profile['bio']}
Skill Offered: {profile['skill_offered']}
Skill Needed: {profile['skill_needed']}



Write a message asking someone to swap skills. Output only the message.
""".strip()
        }
    ]

    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"❌ Error: {e}"

# ✅ Sample test
if __name__ == "__main__":
    profile = {
        "name": "Lakshya",
        "rating": "4.9",
        "bio": "Backend developer who loves scalable APIs and clean code.",
        "skill_offered": "Python & FastAPI",
        "skill_needed": "UI/UX Design"
    }


    message = generate_swap_message(profile)
    print("\n🔹 AI Generated Message:\n")
    print(message)
