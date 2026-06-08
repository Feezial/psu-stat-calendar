// ประกอบ text items ของ PDF เป็นบรรทัดตามตำแหน่ง เพื่อให้ parseSisTranscript แยกต่อได้
// ใช้ฝั่ง server เท่านั้น (API /api/parse-pdf ผ่าน unpdf) — ไม่มี pdf.js/worker ฝั่ง browser แล้ว
// → import PDF ทำงานได้ทุกอุปกรณ์/เบราว์เซอร์ (client แค่อัปโหลดไฟล์, server แกะข้อความ)

interface PdfTextItem {
  str: string
  transform: number[]
}

/** ประกอบ text items ของหนึ่งหน้าเป็นบรรทัด (จัดกลุ่มตามแกน y, เรียงตามแกน x) */
export function reconstructLines(items: unknown[]): string[] {
  const tis = items.filter(
    (i): i is PdfTextItem =>
      typeof (i as PdfTextItem).str === 'string' && Array.isArray((i as PdfTextItem).transform),
  )
  const rows = new Map<number, { x: number; str: string }[]>()
  for (const it of tis) {
    const y = Math.round(it.transform[5])
    let key = y
    for (const k of rows.keys()) {
      if (Math.abs(k - y) <= 2) {
        key = k
        break
      }
    }
    const arr = rows.get(key) ?? []
    arr.push({ x: it.transform[4], str: it.str })
    rows.set(key, arr)
  }
  // PDF origin อยู่ล่างซ้าย → y มาก = บนสุด
  return [...rows.keys()]
    .sort((a, b) => b - a)
    .map((y) =>
      rows
        .get(y)!
        .sort((a, b) => a.x - b.x)
        .map((s) => s.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}
