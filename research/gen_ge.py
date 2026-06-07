# -*- coding: utf-8 -*-
import re, json
src = 'research/ge-structure.txt'
lines = open(src, encoding='utf-8').read().split('\n')

# code pattern: optional letter prefix, 2-3 alnum, dash/endash, 3 digits, then group suffix Gx
code_re = re.compile(r'^([A-Za-z0-9]{2,3}[-–]\d{3})([A-Za-z0-9]*?G(2[AB]|[1-8]))$')

seen = {}
order = []
for raw in lines:
    if '|' not in raw:
        continue
    cells = [c.strip() for c in raw.split('|')]
    if not cells:
        continue
    c0 = cells[0]
    m = code_re.match(c0)
    if not m:
        continue
    # normalize en-dash to hyphen
    code = c0.replace('–', '-').upper()
    grp = 'GE' + m.group(3)
    name_th = cells[1].replace('\n', ' ').strip() if len(cells) > 1 else code
    name_en = ''
    if len(cells) > 2:
        ne = cells[2].replace('\n', ' ').strip().strip('()')
        if ne and ne not in ('-',):
            name_en = ne
    # credits: GE central courses are all 2 credits
    credits = 2
    if code not in seen:
        seen[code] = {'code': code, 'name': name_th, 'nameEn': name_en, 'credits': credits, 'group': grp}
        order.append(code)

cats = {}
for code in order:
    cats.setdefault(seen[code]['group'], []).append(seen[code])

# print summary
for g in ['GE1','GE2A','GE2B','GE3','GE4','GE5','GE6','GE7','GE8']:
    print(g, len(cats.get(g, [])))
print('TOTAL', len(order))

json.dump([seen[c] for c in order], open('research/ge-catalog.json','w',encoding='utf-8'), ensure_ascii=False, indent=0)
