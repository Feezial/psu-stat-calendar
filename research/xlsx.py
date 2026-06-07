import openpyxl, sys
wb=openpyxl.load_workbook(sys.argv[1], data_only=True)
for ws in wb.worksheets:
    print("##### SHEET:", ws.title, "dims", ws.dimensions)
    for r in ws.iter_rows(values_only=True):
        cells=[("" if c is None else str(c)).strip() for c in r]
        if any(cells):
            print(" | ".join(cells))
