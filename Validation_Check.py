import re
import openai
from difflib import SequenceMatcher

openai.api_key = "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"

manual_blocklist = {
    "sex", "sexual", "nude", "naked", "porn", "pornography", "xxx", "strip", "escort", "fetish", "nsfw", "erotic",
    "hardcore", "adult", "incest", "rape", "molest", "orgy", "bang", "kamasutra", "nudity",

    "terrorist", "terrorism", "bomb", "explosive", "murder", "kill", "slaughter", "massacre", "genocide", "execute",
    "assassinate", "behead", "hang", "shoot", "stab", "decapitate", "lynch", "molotov", "torture",

    "drug", "cocaine", "heroin", "marijuana", "weed", "meth", "lsd", "ecstasy", "narcotic", "opium", "overdose",
    "addict", "dealer", "crack",

    "gun", "rifle", "pistol", "weapon", "grenade", "firearm", "sniper", "ak47", "bullet", "shooter", "ammo", "munition",

    "hack", "hacker", "phish", "phishing", "scam", "fraud", "darkweb", "ransomware", "malware", "spyware", "exploit",
    "breach", "ddos",

    "racist", "nazi", "hitler", "kkk", "homophobic", "antisemitic", "islamophobic", "slur", "bigot"
}

def load_txt_set(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return set(line.strip().lower() for line in f if line.strip())

real_skills = load_txt_set("/Users/lakshymehta/Desktop/Hackathons/Odoo_2025_July/skills.txt")
male_names = load_txt_set("/Users/lakshymehta/Desktop/Hackathons/Odoo_2025_July/male.txt")
female_names = load_txt_set("/Users/lakshymehta/Desktop/Hackathons/Odoo_2025_July/female.txt")
all_names = male_names | female_names

def is_gibberish(text):
    known_short_skills = {
    "c", "c++", "c#", "r", "go", "js", "ts", "sql", "html", "css", "php", "asp", "jsx", "tsx","python",

    "ai", "ml", "dl", "cv", "nlp", "ocr", "rl", "pca", "eda", "cnn", "rnn", "lstm", "gpt", "bert", "xgboost", "svm",

    "qa", "ci", "cd", "tdd", "bdd", "api", "sdk", "devops", "sdet", "jest", "pip", "npm", "yarn", "git",

    "ui", "ux", "dom", "svg", "xml", "json", "http", "rest", "soap", "spa", "mvc", "css3", "html5",

    "aws", "gcp", "az", "cli", "ssh", "tcp", "udp", "ftp", "dns", "cdn", "vm", "kvm", "gpu",

    "etl", "ocr", "jwt", "jwt", "sso", "seo", "cms", "crm", "erp", "nosql"
   }

    if text in known_short_skills:
        return False

    if len(text) == 1:
        return True

    if len(text) == 2 and text not in known_short_skills:
        return True

    if len(text) > 2 and text.isalpha() and not any(c in 'aeiou' for c in text):
        return True

    if re.fullmatch(r'[a-z]{6,}', text) and sum(1 for ch in text if ch not in 'aeiou') > len(text) * 0.7:
        return True

    if not re.match(r"^[a-zA-Z0-9 _./#+-]+$", text):
        return True

    return False

def is_inappropriate(text):
    if not openai.api_key or not openai.api_key.startswith("sk-"):
        return False, {}
    try:
        res = openai.Moderation.create(input=text)
        flagged = res["results"][0]["flagged"]
        cats = res["results"][0]["categories"]
        return flagged, cats
    except Exception as e:
        print("⚠️ OpenAI Moderation error:", e)
        return False, {}

def validate_skill(skill_input):
    skill = skill_input.strip().lower()

    flagged, cats = is_inappropriate(skill)
    if flagged:
        reasons = ', '.join([k for k, v in cats.items() if v])
        return False, f" Inappropriate content (via OpenAI): {reasons}"

    for bad_word in manual_blocklist:
        if bad_word in skill:
            return False, f"Inappropriate keyword detected: '{bad_word}'"
        if SequenceMatcher(None, skill, bad_word).ratio() >= 0.85:
            return False, f"Possibly inappropriate (fuzzy match to: '{bad_word}')"

    if skill in all_names:
        return False, "This looks like a name, not a skill."

    if is_gibberish(skill):
        return False, "This looks like gibberish or not a real skill."

    if skill in real_skills:
        return True, "Valid skill!"

    for real_skill in real_skills:
        if real_skill in skill:
            return True, f"Contains valid skill: '{real_skill}'"

    return False, "Unknown skill — not found in list."

if __name__ == "__main__":
    print("🔍 Skill Validator (type 'exit' to quit)")
    while True:
        s = input("Enter skill: ").strip()
        if s.lower() == 'exit':
            break
        valid, message = validate_skill(s)
        print(message)
