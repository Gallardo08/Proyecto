import re

path = "supabase/migrations/001_schema_and_rls.sql"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Arregla los CREATE INDEX
content = re.sub(r"CREATE INDEX (\w+)", r"CREATE INDEX IF NOT EXISTS \1", content)

# Arregla los CREATE POLICY, agregando un DROP POLICY IF EXISTS antes
def fix_policy(match):
    full = match.group(0)
    name = match.group(1)
    table = match.group(2)
    drop = f'DROP POLICY IF EXISTS "{name}" ON {table};\n'
    return drop + full

content = re.sub(
    r'CREATE POLICY "([^"]+)"\s+ON (public\.\w+)',
    fix_policy,
    content
)

# Arregla los CREATE TRIGGER, agregando un DROP TRIGGER IF EXISTS antes
def fix_trigger(match):
    full = match.group(0)
    name = match.group(1)
    table = match.group(2)
    drop = f'DROP TRIGGER IF EXISTS {name} ON {table};\n'
    return drop + full

content = re.sub(
    r'CREATE TRIGGER (\w+)\s+(?:BEFORE|AFTER)\s+\w+(?:\s+OR\s+\w+)*\s+ON (public\.\w+|auth\.\w+)',
    fix_trigger,
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Listo. Archivo actualizado.")
