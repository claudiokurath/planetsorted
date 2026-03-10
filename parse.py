import csv
import json
import os

base_dir = '/Users/claudiokurath/Downloads/ExportBlock-f6a7f049-6d2f-42f0-8f1c-f2ec0079d6f7-Part-1/SOR7ED LAB/2a90d6014acc817d8a0500426af2eb6c'
app_dir = '/Users/claudiokurath/Downloads/ExportBlock-f6a7f049-6d2f-42f0-8f1c-f2ec0079d6f7-Part-1/Private & Shared/sor7ed-app'

blog_csv = os.path.join(base_dir, 'BLOG db668e4687ed455498357b8d11d2c714.csv')
tools_csv = os.path.join(base_dir, 'TOOLS 08ac767d313845ca91886ce45c379b99.csv')

out_dir = os.path.join(app_dir, 'src/data')
os.makedirs(out_dir, exist_ok=True)

def parse_csv(path):
    data = []
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

blog_data = parse_csv(blog_csv)
tools_data = parse_csv(tools_csv)

with open(os.path.join(out_dir, 'blog.json'), 'w') as f:
    json.dump(blog_data, f, indent=2)

with open(os.path.join(out_dir, 'tools.json'), 'w') as f:
    json.dump(tools_data, f, indent=2)

print("Parsed successfully!")
