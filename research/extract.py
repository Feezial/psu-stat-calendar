import sys, pypdf
src=sys.argv[1]; out=sys.argv[2]
r=pypdf.PdfReader(src)
print("PAGES", len(r.pages))
with open(out,"w",encoding="utf-8") as f:
    for i,p in enumerate(r.pages):
        f.write(f"\n===== PAGE {i+1} =====\n")
        f.write(p.extract_text() or "")
