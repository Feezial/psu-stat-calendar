/** ทำให้รหัสวิชาเป็นรูปแบบมาตรฐาน: ตัดช่องว่าง, ตัวพิมพ์ใหญ่ (เก็บ suffix เช่น G2A) */
export function normalizeCode(raw: string): string {
  return (raw || '').trim().toUpperCase().replace(/\s+/g, '')
}
