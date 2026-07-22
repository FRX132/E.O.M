import json
import re

with open('./src/data/female_anatomy.json', 'r') as f:
    data = json.load(f)

min_x = float('inf')
max_x = float('-inf')
min_y = float('inf')
max_y = float('-inf')

for m in data['back']:
    for paths in m['path'].values():
        for p in paths:
            match = re.search(r'm\s+([0-9.-]+),([0-9.-]+)', p, re.IGNORECASE)
            if match:
                x, y = float(match.group(1)), float(match.group(2))
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)

print(f"Min X: {min_x}, Max X: {max_x}")
print(f"Min Y: {min_y}, Max Y: {max_y}")
