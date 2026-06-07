# -*- coding: utf-8 -*-
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('Thai', r'C:\Windows\Fonts\tahoma.ttf'))
W, H = A4
COLS = [50, 110, 360, 420, 480]  # x for code, name, section, credits, grade

def header(c, term):
    c.setFont('Thai', 16)
    c.drawString(50, H - 50, 'ผลการเรียน')
    c.setFont('Thai', 11)
    c.drawString(50, H - 70, 'นายลฏุฟี บินมะสาและ รหัสนักศึกษา 6710210764')
    c.setFont('Thai', 13)
    c.drawString(50, H - 100, f'ภาคการศึกษา {term}')
    c.setFont('Thai', 9)
    labels = ['รหัสวิชา', 'ชื่อวิชา', 'ตอน', 'หน่วยกิต', 'ผลการเรียน']
    for x, t in zip(COLS, labels):
        c.drawString(x, H - 120, t)

def row(c, y, code, name, sec, cr, grade):
    c.setFont('Thai', 9)
    for x, t in zip(COLS, [code, name, sec, str(cr), grade]):
        c.drawString(x, y, t)

def page(c, term, rows):
    header(c, term)
    y = H - 140
    for r in rows:
        row(c, y, *r)
        y -= 18
    c.setFont('Thai', 9)
    c.drawString(50, y - 10, 'สรุประดับภาคการศึกษา (Semester)')
    c.drawString(50, y - 24, 'หน่วยกิตที่ลงทะเบียน 21')
    c.showPage()

c = canvas.Canvas('research/sample-sis.pdf', pagesize=A4)
page(c, '1/2567', [
    ('145-101', 'COMPANION ANIMALS', '01', 3, 'A'),
    ('322-101', 'CALCULUS I', '03', 3, 'D'),
    ('324-101', 'GENERAL CHEMISTRY I', '02', 3, 'D+'),
    ('346-111', 'PRINCIPLES OF STATISTICS', '01', 3, 'C'),
    ('890-101G1', 'ESSENTIAL ENGLISH', '16', 2, 'U'),
])
page(c, '2/2567', [
    ('193-031G8', 'NATURAL THERAPY', '04', 2, 'B+'),
    ('322-102', 'CALCULUS II', '01', 3, 'W'),
    ('346-161', 'STANDARD STATISTICAL SOFTWARE', '01', 3, 'C'),
    ('890-102G1', 'EVERYDAY ENGLISH', '13', 2, 'E'),
])
c.save()
print('wrote research/sample-sis.pdf')
