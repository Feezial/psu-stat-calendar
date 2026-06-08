# Parse ทุก tab → ดึงรายวิชา GE (regex รหัส) → เทียบกับ ge-catalog.ts
import json, re
from collections import Counter

CODE_RE = re.compile(r'^[A-Z0-9]{3}-\d{3}G\d[AB]?$')   # 895-301G3, B03-001G4, 473-001G2A
GROUP_RE = re.compile(r'G(\d[AB]?)$')

def credits_of(s):
    m = re.match(r'\s*(\d+)', s or '')
    return int(m.group(1)) if m else None

def group_of(code):
    m = GROUP_RE.search(code)
    return 'GE' + m.group(1) if m else '?'

# 1) extract from both sheets, all tabs
sheets = {}
for sf in ['sheet1', 'sheet2']:
    data = json.load(open(f'scrape/{sf}.json', encoding='utf-8'))
    for tab, rows in data.items():
        for r in rows:
            if not r:
                continue
            code = r[0].strip()
            if not CODE_RE.match(code):
                continue
            rec = sheets.setdefault(code, {'group': group_of(code), 'thai': set(), 'eng': set(), 'cr': set(), 'src': set()})
            if len(r) > 1 and r[1].strip():
                rec['thai'].add(r[1].strip())
            if len(r) > 2 and r[2].strip() and r[2].strip() not in ('()',):
                rec['eng'].add(r[2].strip().strip('()'))
            if len(r) > 3:
                c = credits_of(r[3])
                if c:
                    rec['cr'].add(c)
            rec['src'].add(sf)

# 2) read codes currently in catalog
ts = open('lib/curriculum/ge-catalog.ts', encoding='utf-8').read()
cat = {}
for m in re.finditer(r'code:\s*["\']([^"\']+)["\'][^\n]*group:\s*[\'"](GE[0-9AB]+)[\'"]', ts):
    cat[m.group(1)] = m.group(2)

sc, cc = set(sheets), set(cat)
print(f"SHEETS: {len(sc)} GE-coded courses | CATALOG: {len(cc)} entries")
print("per-group SHEETS :", dict(sorted(Counter(sheets[c]['group'] for c in sheets).items())))
print("per-group CATALOG:", dict(sorted(Counter(cat.values()).items())))

print(f"\n### MISSING from catalog (in sheets, not catalog) — {len(sc-cc)} ###")
for c in sorted(sc - cc):
    print(f"  + {c}  {sheets[c]['group']}  {max(sheets[c]['cr']) if sheets[c]['cr'] else '?'}นก  src={sorted(sheets[c]['src'])}  {('/'.join(list(sheets[c]['thai'])[:1]))[:45]}")

print(f"\n### in CATALOG but NOT in sheets (legacy/old or removed?) — {len(cc-sc)} ###")
for c in sorted(cc - sc):
    print(f"  - {c}  catalog={cat[c]}")

print(f"\n### GROUP MISMATCH — ###")
for c in sorted(sc & cc):
    if sheets[c]['group'] != cat[c]:
        print(f"  ! {c}  sheet={sheets[c]['group']}  catalog={cat[c]}")

# 3) authoritative dataset (pick longest thai/eng, max credits)
def pick(s):
    return sorted(s, key=len, reverse=True)[0] if s else ''
auth = {c: {'code': c, 'group': sheets[c]['group'], 'thai': pick(sheets[c]['thai']),
            'eng': pick(sheets[c]['eng']), 'cr': max(sheets[c]['cr']) if sheets[c]['cr'] else 2}
        for c in sheets}
json.dump(auth, open('scrape/authoritative.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"\nwrote scrape/authoritative.json ({len(auth)} courses)")
