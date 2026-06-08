// ดึงข้อความจากไฟล์ PDF ในเบราว์เซอร์ด้วย pdf.js (lazy-load เฉพาะตอนใช้)
// คืนข้อความทุกหน้าโดยประกอบเป็นบรรทัดตามตำแหน่ง เพื่อให้ parseSisTranscript แยกต่อได้

interface PdfTextItem {
  str: string
  transform: number[]
}

/** ประกอบ text items ของหนึ่งหน้าเป็นบรรทัด (จัดกลุ่มตามแกน y, เรียงตามแกน x) */
function reconstructLines(items: unknown[]): string[] {
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

export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  // legacy build = transpiled + polyfill → รองรับเบราว์เซอร์เก่า (iOS Safari ฯลฯ)
  // แก้บั๊ก "undefined is not a function" ที่เกิดกับบางเครื่อง (build ปกติใช้ modern API ที่บางเบราว์เซอร์ไม่มี)
  // หมายเหตุ: main build กับ worker ต้องเป็น legacy ทั้งคู่ — postinstall คัด legacy worker มาที่ /pdf.worker.min.mjs
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise
  const pages: string[] = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    pages.push(reconstructLines(content.items).join('\n'))
  }
  await pdf.cleanup()
  return pages.join('\n')
}
