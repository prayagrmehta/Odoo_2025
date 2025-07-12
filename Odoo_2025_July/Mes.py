from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai

# 🔑 OpenRouter API setup
openai.api_key = "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"
openai.api_base = "https://openrouter.ai/api/v1"

# ⚙️ FastAPI app
app = FastAPI()

# ✅ Request models
class PromptRequest(BaseModel):
    prompt: str

class ProfileRequest(BaseModel):
    name: str
    rating: str
    bio: str
    skill_offered: str
    skill_needed: str

# ✅ Route 1: Just prompt
@app.post("/generate-message-prompt")
def generate_from_prompt(req: PromptRequest):
    try:
        response = openai.ChatCompletion.create(
            model="mistralai/mistral-7b-instruct",
            messages=[
                {"role": "system", "content": "You write short, polite skill-swap messages."},
                {"role": "user", "content": req.prompt}
            ]
        )
        return {"message": response["choices"][0]["message"]["content"].strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error: {str(e)}")


# ✅ Route 2: Full profile + prompt
@app.post("/generate-message-profile")
def generate_from_profile(req: ProfileRequest):
    try:
        user_prompt = f"""
Name: {req.name}
Rating: {req.rating}
Bio: {req.bio}
Skill Offered: {req.skill_offered}
Skill Needed: {req.skill_needed}


Write a message asking someone to swap skills. Output only the message.
""".strip()

        response = openai.ChatCompletion.create(
            model="mistralai/mistral-7b-instruct",
            messages=[
                {"role": "system", "content": "You are helping users write personalized skill-swap request messages. Be polite, match the tone, and keep it short."},
                {"role": "user", "content": user_prompt}
            ]
        )
        return {"message": response["choices"][0]["message"]["content"].strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error: {str(e)}")
