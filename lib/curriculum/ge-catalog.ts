/**
 * แคตตาล็อกหมวดวิชาศึกษาทั่วไป (GE) กลาง ม.อ. ฉบับปรับปรุงตามเกณฑ์ 2565 — วิทยาเขตหาดใหญ่
 * ที่มา: research/ge-structure.txt (โครงสร้างรายวิชา GE หาดใหญ่ จาก gened.psu.ac.th)
 * group: GE1 ภาษา, GE2A ตรรกะ/ตัวเลข, GE2B คิดเชิงระบบ, GE3 ผู้ประกอบการ,
 *        GE4 ดิจิทัล, GE5 สุขภาวะ, GE6 จิตสาธารณะ/ยั่งยืน, GE7 ปรับตัวพลวัตโลก, GE8 เลือก
 */
export type GeGroup = 'GE1' | 'GE2A' | 'GE2B' | 'GE3' | 'GE4' | 'GE5' | 'GE6' | 'GE7' | 'GE8'

export interface GeCourse {
  code: string
  name: string
  nameEn?: string
  credits: number
  group: GeGroup
  audit?: boolean
}

export const GE_CATALOG: GeCourse[] = [
  // ── GE1 ภาษาและการสื่อสาร (เลือก 2 จาก 890-102..105; 890-101 audit ไม่นับ) ──
  { code: '890-101G1', name: 'สรรสาระภาษาอังกฤษ', nameEn: 'Essential English', credits: 2, group: 'GE1', audit: true },
  { code: '890-102G1', name: 'ภาษาอังกฤษในชีวิตประจำวัน', nameEn: 'Everyday English', credits: 2, group: 'GE1' },
  { code: '890-103G1', name: 'ภาษาอังกฤษพร้อมใช้', nameEn: 'English on the Go', credits: 2, group: 'GE1' },
  { code: '890-104G1', name: 'ภาษาอังกฤษยุคดิจิทัล', nameEn: 'English in the Digital World', credits: 2, group: 'GE1' },
  { code: '890-105G1', name: 'ภาษาอังกฤษเชิงวิชาการ', nameEn: 'English for Academic Success', credits: 2, group: 'GE1' },

  // ── GE2A การคิดเชิงตรรกะและตัวเลข ──
  { code: '895-211G2A', name: 'การคิดกับพฤติกรรมพยากรณ์', nameEn: 'Thinking and Behavioral Prediction', credits: 2, group: 'GE2A' },
  { code: '315-100G2A', name: 'คำนวณศิลป์', nameEn: 'The Art of Computing', credits: 2, group: 'GE2A' },
  { code: '322-100G2A', name: 'รวยด้วยคณิตศาสตร์', nameEn: 'Getting Rich with Mathematics', credits: 2, group: 'GE2A' },
  { code: '473-001G2A', name: 'เงินทองต้องรอบรู้', nameEn: 'Financial Literacy for a Better Life', credits: 2, group: 'GE2A' },
  { code: '473-002G2A', name: 'การอ่านงบการเงินเพื่อการลงทุน', nameEn: 'Reading Financial Statements for Investment', credits: 2, group: 'GE2A' },
  { code: '142-010G2A', name: 'คิดไปข้างหน้า', nameEn: 'Organic Thinking', credits: 2, group: 'GE2A' },

  // ── GE2B การคิดเชิงระบบ ──
  { code: '895-221G2B', name: 'การคิดกับการแก้ปัญหาเชิงระบบ', nameEn: 'Thinking and Systematic Problem Solving', credits: 2, group: 'GE2B' },
  { code: '895-222G2B', name: 'การคิดเชิงวิพากษ์', nameEn: 'Critical Thinking', credits: 2, group: 'GE2B' },
  { code: '895-223G2B', name: 'คิดสร้างสุข', nameEn: 'Cultivating Happiness through Positivity', credits: 2, group: 'GE2B' },
  { code: '895-224G2B', name: 'ตรรกะในชีวิตประจำวัน', nameEn: 'Logic in Daily Life', credits: 2, group: 'GE2B' },
  { code: '895-225G2B', name: 'เท่าทันสถานการณ์โลก', nameEn: 'The World Today', credits: 2, group: 'GE2B' },
  { code: '315-202G2B', name: 'การคิดกับการใช้เหตุผล', nameEn: 'Thinking and Reasoning', credits: 2, group: 'GE2B' },

  // ── GE3 การคิดแบบผู้ประกอบการ ──
  { code: '895-301G3', name: 'ก้าวแรกสู่ความเป็นผู้ประกอบการ', nameEn: 'First Steps to Entrepreneurship', credits: 2, group: 'GE3' },
  { code: '895-302G3', name: 'จุดประกายความคิดผ่านแนวคิดผู้ประกอบการ', nameEn: 'Activating Innovative Ideas through an Entrepreneurial Mindset', credits: 2, group: 'GE3' },
  { code: '460-001G3', name: 'แนวคิดและทักษะความเป็นผู้ประกอบการ', nameEn: 'Entrepreneurial Mindset and Skills', credits: 2, group: 'GE3' },

  // ── GE4 การใช้เทคโนโลยีดิจิทัล ──
  { code: '315-104G4', name: 'รู้ทันเทคโนโลยีดิจิทัล', nameEn: 'Digital Technology Literacy', credits: 2, group: 'GE4' },
  { code: '200-107G4', name: 'การเชื่อมต่อสรรพสิ่งเพื่อชีวิตยุคดิจิทัล', nameEn: 'Internet of Things for Digital Life', credits: 2, group: 'GE4' },
  { code: '200-104G4', name: 'รู้เท่าทันปัญญาประดิษฐ์', nameEn: 'Artificial Intelligence Literacy', credits: 2, group: 'GE4' },
  { code: '142-027G4', name: 'เทคโนโลยีเอไอและการรู้เท่าทัน', nameEn: 'AI Technologies and Literacy', credits: 2, group: 'GE4' },
  { code: '345-103G4', name: 'เทคโนโลยีดิจิทัลเพื่อชีวิตประจำวันและการเรียนรู้', nameEn: 'Digital Technology for Everyday Life and Learning', credits: 2, group: 'GE4' },

  // ── GE5 สุขภาวะองค์รวม ──
  { code: '895-501G5', name: 'สุนทรียศาสตร์แห่งชีวิต', nameEn: 'Life Aesthetics', credits: 2, group: 'GE5' },
  { code: '895-502G5', name: 'พัฒนาจิตกับการสื่อสารเพื่อเข้าใจชีวิตมนุษย์', nameEn: 'Mental Training for Empathetic Communication', credits: 2, group: 'GE5' },
  { code: '895-503G5', name: 'สุขภาวะในการทำงาน', nameEn: 'Well-being at Work', credits: 2, group: 'GE5' },
  { code: '895-504G5', name: 'ความหมายของชีวิต', nameEn: 'Meaning of Life', credits: 2, group: 'GE5' },
  { code: '950-102G5', name: 'การปรับตัวของคนยุคใหม่ในสังคมใหม่', nameEn: 'Adaptation of the New Generation to the New Society', credits: 2, group: 'GE5' },
  { code: '388-100G5', name: 'สุขภาวะเพื่อเพื่อนมนุษย์', nameEn: 'Health for All', credits: 2, group: 'GE5' },
  { code: '670-111G5', name: 'สุขภาพองค์รวม', nameEn: 'Holistic Health', credits: 2, group: 'GE5' },
  { code: '142-022G5', name: 'โลกสวย', nameEn: 'Life is Beautiful', credits: 2, group: 'GE5' },

  // ── GE6 จิตสาธารณะและการพัฒนาที่ยั่งยืน ──
  { code: '895-601G6', name: 'พลเมืองตื่นรู้เพื่อการพัฒนาที่ยั่งยืน', nameEn: 'Active Citizens for Sustainable Development', credits: 2, group: 'GE6' },
  { code: '001-102G6', name: 'เป้าหมายการพัฒนาที่ยั่งยืนและการรับผิดชอบต่อส่วนรวม', nameEn: 'SDGs and Social Responsibility', credits: 2, group: 'GE6' },
  { code: '003-001G6', name: 'ผู้นำจิตอาสาเพื่อการพัฒนาชุมชน', nameEn: 'Volunteer Leader for Community Development', credits: 2, group: 'GE6' },
  { code: '142-025G6', name: 'ประโยชน์เพื่อนมนุษย์', nameEn: 'Benefits of Mankind', credits: 2, group: 'GE6' },

  // ── GE7 การปรับตัวให้เข้ากับพลวัตของโลก ──
  { code: '820-100G7', name: 'รักษ์โลก รักษ์เรา', nameEn: 'Save Earth Save Us', credits: 2, group: 'GE7' },
  { code: '820-200G7', name: 'เมื่อทะเลปั่นป่วน', nameEn: 'Disrupted Sea', credits: 2, group: 'GE7' },
  { code: '315-201G7', name: 'ชีวิตแห่งอนาคต', nameEn: 'Life in the Future', credits: 2, group: 'GE7' },
  { code: '315-204G7', name: 'รักษ์ทะเล', nameEn: 'Marine Conservation', credits: 2, group: 'GE7' },
  { code: '895-701G7', name: 'มนุษยชาติกับความไม่แน่นอน', nameEn: 'Humanity and Uncertainties', credits: 2, group: 'GE7' },
  { code: '200-103G7', name: 'ชีวิตยุคใหม่หัวใจสีเขียว', nameEn: 'Modern Life for Green Love', credits: 2, group: 'GE7' },
  { code: '142-024G7', name: 'ศิลปะการดำเนินชีวิต', nameEn: 'Art of Living', credits: 2, group: 'GE7' },

  // ── GE8 รายวิชาเลือก (≥6 นก) — ตัวอย่างชุดใหญ่; เพิ่มได้จาก research/ge-structure.txt ──
  // สุนทรียศาสตร์/ดนตรี
  { code: '895-861G8', name: 'กีตาร์', nameEn: 'The Guitar', credits: 2, group: 'GE8' },
  { code: '895-862G8', name: 'อูคูเลเล่', nameEn: 'The Ukulele', credits: 2, group: 'GE8' },
  { code: '895-865G8', name: 'ขิมไทย', nameEn: 'The Traditional Thai Dulcimer', credits: 2, group: 'GE8' },
  { code: '895-833G8', name: 'ดูหนังดูละครย้อนดูตน', nameEn: 'Drama and Self-reflection', credits: 2, group: 'GE8' },
  { code: '895-834G8', name: 'วาดเส้นสร้างสรรค์', nameEn: 'Creative Drawing', credits: 2, group: 'GE8' },
  { code: '315-102G8', name: 'สุนทรียศาสตร์การถ่ายภาพ', nameEn: 'The Aesthetic in Photography', credits: 2, group: 'GE8' },
  { code: '061-001G8', name: 'ความงามของนาฏศิลป์ไทย', nameEn: 'Aesthetics of Thai Dance', credits: 2, group: 'GE8' },
  // กีฬา
  { code: '895-873G8', name: 'ฟุตซอล', nameEn: 'Futsal', credits: 2, group: 'GE8' },
  { code: '895-875G8', name: 'แบดมินตัน', nameEn: 'Badminton', credits: 2, group: 'GE8' },
  { code: '895-876G8', name: 'ว่ายน้ำ', nameEn: 'Swimming', credits: 2, group: 'GE8' },
  { code: '895-880G8', name: 'การออกกำลังกายเพื่อสุขภาพ', nameEn: 'Exercise for Health', credits: 2, group: 'GE8' },
  { code: '895-884G8', name: 'บาสเกตบอล', nameEn: 'Basketball', credits: 2, group: 'GE8' },
  { code: '895-885G8', name: 'มวยไทย', nameEn: 'Muay Thai', credits: 2, group: 'GE8' },
  { code: '895-886G8', name: 'วอลเลย์บอล', nameEn: 'Volleyball', credits: 2, group: 'GE8' },
  { code: '895-887G8', name: 'ฟุตบอล', nameEn: 'Football', credits: 2, group: 'GE8' },
  // มนุษย์/สังคม
  { code: '895-811G8', name: 'จิตวิทยาความรัก', nameEn: 'Psychology of Love', credits: 2, group: 'GE8' },
  { code: '895-812G8', name: 'ชีวิตดี มีจิตวิทยา', nameEn: 'Psychology for Good Life', credits: 2, group: 'GE8' },
  { code: '895-818G8', name: 'ทักษะชีวิตในสังคม 5.0', nameEn: 'Life Skills in Society 5.0', credits: 2, group: 'GE8' },
  { code: '895-831G8', name: 'จริยศาสตร์แห่งชีวิต', nameEn: 'Ethics for Life', credits: 2, group: 'GE8' },
  { code: '874-191G8', name: 'ความรู้พื้นฐานเกี่ยวกับระบบกฎหมายไทย', nameEn: 'Introduction to Thai Legal System', credits: 2, group: 'GE8' },
  { code: '874-194G8', name: 'ภาษีอากรกับชีวิต', nameEn: 'Taxation and Life', credits: 2, group: 'GE8' },
  // วิทย์/เทคโนโลยี/สุขภาพ
  { code: '315-103G8', name: 'ความรู้ทั่วไปทางด้านทรัพย์สินทางปัญญา', nameEn: 'Introduction to Intellectual Property', credits: 2, group: 'GE8' },
  { code: '315-203G8', name: 'กุญแจไขธรรมชาติ', nameEn: 'Key to Nature', credits: 2, group: 'GE8' },
  { code: '315-205G8', name: 'วิทย์คิดรวย', nameEn: 'Science Entrepreneur Pitching', credits: 2, group: 'GE8' },
  { code: '315-206G8', name: 'ไขความจริงทุกสรรพสิ่ง', nameEn: 'Science Facts', credits: 2, group: 'GE8' },
  { code: '336-214G8', name: 'กินดี ชีวิตดี', nameEn: 'Smart Eating and Being Healthy', credits: 2, group: 'GE8' },
  { code: '338-101G8', name: 'เรื่องของฉัน', nameEn: 'My Body and Health', credits: 2, group: 'GE8' },
  { code: '193-031G8', name: 'ธรรมชาติบำบัด', nameEn: 'Natural Therapy', credits: 2, group: 'GE8' },
  { code: '003-002G8', name: 'ม.อ.เพื่อเพื่อนมนุษย์', nameEn: 'PSU for Mankind', credits: 2, group: 'GE8' },
  { code: '001-101G8', name: 'อาเซียนศึกษา', nameEn: 'ASEAN Studies', credits: 2, group: 'GE8' },
  { code: '858-162G8', name: 'เลือกซื้อ เลือกกิน อย่างชาญฉลาด', nameEn: 'Being a Smart Consumer', credits: 2, group: 'GE8' },
  { code: '500-101G8', name: 'ฟาร์มสุข', nameEn: 'Happy Farm', credits: 2, group: 'GE8' },
  { code: '200-105G8', name: 'สมาธิเพื่อพัฒนาชีวิต', nameEn: 'Meditation for Life Development', credits: 2, group: 'GE8' },
  // ภาษาต่างประเทศ (ตัวอย่าง)
  { code: '891-821G8', name: 'ภาษาจีนเบื้องต้น', nameEn: 'Basic Chinese', credits: 2, group: 'GE8' },
  { code: '891-811G8', name: 'ก้าวแรกสู่ภาษาญี่ปุ่น', nameEn: 'First Steps to Japanese', credits: 2, group: 'GE8' },
  { code: '891-831G8', name: 'ภาษามลายูเบื้องต้น', nameEn: 'Basic Malay', credits: 2, group: 'GE8' },
  { code: '891-841G8', name: 'พูดได้ พูดดี ภาษาเกาหลีเบื้องต้น', nameEn: 'Survival Korean for Thais', credits: 2, group: 'GE8' },
  // วิชา GE รหัสเก่าที่ยังพบใน transcript (นับเป็น GE8 เลือก)
  { code: '145-101', name: 'สัตว์เลี้ยงเพื่อนรัก', nameEn: 'Companion Animals', credits: 3, group: 'GE8' },
]

export const GE_BY_CODE: Record<string, GeCourse> = Object.fromEntries(
  GE_CATALOG.map((c) => [c.code, c]),
)
