# -*- coding: utf-8 -*-
import json

VALID = {'GE1','GE2A','GE2B','GE3','GE4','GE5','GE6','GE7','GE8'}
d = json.load(open('research/ge-catalog.json', encoding='utf-8'))
# กรองกลุ่มที่ไม่อยู่ในโครงสร้าง (เช่น 388-12xG2 ของคณะแพทย์ ซึ่งกลายเป็น 'GE2')
d = [x for x in d if x['group'] in VALID]

def s(x):
    # json.dumps gives a valid double-quoted JS/TS string literal with proper escaping
    return json.dumps(x if x is not None else '', ensure_ascii=False)

out = []
out.append('/**')
out.append(' * แคตตาล็อกหมวดวิชาศึกษาทั่วไป (GE) กลาง ม.อ. หาดใหญ่ — ฉบับปรับปรุงตามเกณฑ์ 2565')
out.append(' * อัปเดตล่าสุดจากโครงสร้างรายวิชา GE ทางการ (gened.psu.ac.th — รวมมติสภามหาวิทยาลัยถึงปี 2569)')
out.append(' * ที่มา: research/ge-structure.txt | generate โดย research/gen_ge2.py')
out.append(' * group: GE1 ภาษา, GE2A ตรรกะ/ตัวเลข, GE2B คิดเชิงระบบ, GE3 ผู้ประกอบการ,')
out.append(' *        GE4 ดิจิทัล, GE5 สุขภาวะ, GE6 จิตสาธารณะ/ยั่งยืน, GE7 ปรับตัวพลวัตโลก, GE8 เลือก')
out.append(' */')
out.append("export type GeGroup = 'GE1' | 'GE2A' | 'GE2B' | 'GE3' | 'GE4' | 'GE5' | 'GE6' | 'GE7' | 'GE8'")
out.append('')
out.append('export interface GeCourse {')
out.append('  code: string')
out.append('  name: string')
out.append('  nameEn?: string')
out.append('  credits: number')
out.append('  group: GeGroup')
out.append('  audit?: boolean')
out.append('}')
out.append('')
out.append('export const GE_CATALOG: GeCourse[] = [')

cur = None
for x in d:
    if x['group'] != cur:
        cur = x['group']
        out.append('  // ' + cur)
    parts = ['code: ' + s(x['code']), 'name: ' + s(x['name'])]
    if x.get('nameEn'):
        parts.append('nameEn: ' + s(x['nameEn']))
    parts.append('credits: ' + str(x['credits']))
    parts.append("group: '" + x['group'] + "'")
    if x['code'] == '890-101G1':
        parts.append('audit: true')
    out.append('  { ' + ', '.join(parts) + ' },')

out.append('  // วิชา GE รหัสเก่าที่ยังพบใน transcript (นับเป็น GE8 เลือก)')
out.append("  { code: '145-101', name: 'สัตว์เลี้ยงเพื่อนรัก', nameEn: 'Companion Animals', credits: 3, group: 'GE8' },")
out.append(']')
out.append('')
out.append('export const GE_BY_CODE: Record<string, GeCourse> = Object.fromEntries(')
out.append('  GE_CATALOG.map((c) => [c.code, c]),')
out.append(')')
out.append('')

open('lib/curriculum/ge-catalog.ts', 'w', encoding='utf-8').write('\n'.join(out))
print('wrote lib/curriculum/ge-catalog.ts with', len(d) + 1, 'GE entries')
