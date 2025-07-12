import pandas as pd

def convert_excel_to_txt(input_xlsx='/Users/lakshymehta/Desktop/Hackathons/Odoo_2025_July/skills_dataset.xlsx', output_txt='skills.txt'):
    # Load the Excel file (reads first sheet by default)
    df = pd.read_excel(input_xlsx)

    # Get the first column, clean it, and convert to lowercase
    skills = df.iloc[:, 0].dropna().astype(str).str.strip().str.lower().unique()

    # Write cleaned skills to text file
    with open(output_txt, 'w', encoding='utf-8') as f:
        for skill in skills:
            f.write(skill + '\n')

    print(f"✅ Converted {len(skills)} skills to '{output_txt}'")

# Example usage
convert_excel_to_txt('skills_dataset.xlsx', 'skills.txt')
