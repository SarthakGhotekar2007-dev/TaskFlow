import ast
import os
import sys

def get_imports_from_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            tree = ast.parse(f.read())
        except Exception:
            return set()
    
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for n in node.names:
                imports.add(n.name.split('.')[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split('.')[0])
    return imports

def main():
    root = '.'
    all_imports = set()
    for dirpath, _, filenames in os.walk(root):
        if 'venv' in dirpath or '.venv' in dirpath or '__pycache__' in dirpath:
            continue
        for file in filenames:
            if file.endswith('.py'):
                filepath = os.path.join(dirpath, file)
                imports = get_imports_from_file(filepath)
                all_imports.update(imports)
    
    print("Found imports:")
    for imp in sorted(list(all_imports)):
        print(imp)

if __name__ == "__main__":
    main()
