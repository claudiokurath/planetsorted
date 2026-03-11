import json
import os
import urllib.parse
import shutil

def fix_json(file_path, type_str):
    with open(file_path, 'r') as f:
        data = json.load(f)

    for item in data:
        img_path = item.get("Cover Image", "")
        if img_path.startswith("../SOR7ED"):
            decoded_path = urllib.parse.unquote(img_path)
            abs_base = "/Users/claudiokurath/Downloads/ExportBlock-f6a7f049-6d2f-42f0-8f1c-f2ec0079d6f7-Part-1"
            rel_to_base = decoded_path.replace("../", "", 1)
            src_file = os.path.join(abs_base, rel_to_base)

            os.makedirs(f"public/images/{type_str}", exist_ok=True)
            slug = item.get("Slug", item.get("Title", item.get("Name", "unknown")).replace(" ", "-").lower())
            
            # The files might be .jpeg or .png, rely on the original extension
            ext = os.path.splitext(src_file)[1] or ".png"
            dest_file = f"public/images/{type_str}/{slug}{ext}"
            dest_abs = os.path.join(os.getcwd(), dest_file)

            if os.path.exists(src_file):
                shutil.copy2(src_file, dest_abs)
                item["Cover Image"] = f"/images/{type_str}/{slug}{ext}"
            else:
                print(f"Warning: Could not find image at {src_file}")

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

fix_json("src/data/blog.json", "blog")
fix_json("src/data/tools.json", "tools")
print("Done fixing images.")
