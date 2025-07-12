from fastapi import FastAPI, Query
from pydantic import BaseModel
import google.generativeai as genai
from difflib import get_close_matches

# === CONFIG ===
API_KEY = "AIzaSyDVk4RJ0snOnWgrV8nXTYn-8fEBOWqirKk"
SKILL_FILE = "skills.txt"
BLOCKLIST = {"sex", "porn", "rape", "weapon", "nazi"}

genai.configure(api_key=API_KEY)

# === LOAD SKILLS ===
def load_skills(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return sorted(set(line.strip().lower() for line in f if line.strip()))

REAL_SKILLS = load_skills(SKILL_FILE)

# === AI VALIDATION ===
def validate_with_gemini(skill, skill_list):
    model = genai.GenerativeModel("gemini-pro")
    prompt = f"""
User typed: "{skill}"

From the list below, are any of these valid skill names?
{', '.join(skill_list[:200])}

Respond with:
- VALID: if it's an exact skill.
- SUGGESTION: <closest skill> if it's a likely typo.
- INAPPROPRIATE: if unsafe.
- INVALID: if not a skill.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini error:", e)
        return "ERROR"

# === FINAL VALIDATION LOGIC ===
def validate_skill(skill):
    skill = skill.strip().lower()

    if any(bad in skill for bad in BLOCKLIST):
        return "Blocked"

    if skill in REAL_SKILLS:
        return skill  # Exact match, return skill itself

    matches = get_close_matches(skill, REAL_SKILLS, n=1, cutoff=0.85)
    if matches:
        return f"Do you mean: {matches[0]}"

    result = validate_with_gemini(skill, REAL_SKILLS)
    if result.startswith("VALID"):
        return skill
    elif result.startswith("SUGGESTION:"):
        suggestion = result.split(":", 1)[1].strip()
        return f"Do you mean: {suggestion}"
    elif result.startswith("INAPPROPRIATE"):
        return "Blocked"
    else:
        return "No exist"

# === FASTAPI ===
app = FastAPI()

class SkillInput(BaseModel):
    skill: str

@app.get("/")
def root():
    return {"message": "Welcome to the Gemini Skill Validator API"}

@app.post("/validate_skill/")
def validate(skill_input: SkillInput):
    skill = skill_input.skill
    result = validate_skill(skill)
    return {"result": result}
