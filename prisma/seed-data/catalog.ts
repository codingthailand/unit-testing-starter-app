/** ข้อมูลตั้งต้นของแคตตาล็อก (ใช้ทั้ง seed และสคริปต์สร้างรูปปก) */

export const CATEGORIES = [
  { slug: "frontend", name: "Frontend", color: ["#6366f1", "#8b5cf6"] },
  { slug: "backend", name: "Backend", color: ["#0ea5e9", "#2563eb"] },
  { slug: "testing", name: "Software Testing", color: ["#10b981", "#0d9488"] },
  { slug: "mobile", name: "Mobile", color: ["#f59e0b", "#ea580c"] },
  { slug: "devops", name: "DevOps", color: ["#ec4899", "#e11d48"] },
] as const

export type SeedCourse = {
  slug: string
  title: string
  summary: string
  category: (typeof CATEGORIES)[number]["slug"]
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  priceBaht: number
  isPublished: boolean
  lessons: string[]
  /** วันที่สร้างย้อนหลังจากวันนี้ (ใช้เรียง "ใหม่ล่าสุด") */
  createdDaysAgo: number
}

export const COURSES: SeedCourse[] = [
  {
    slug: "react-fundamentals",
    title: "React พื้นฐานสำหรับมือใหม่",
    summary: "เข้าใจ Component, Props, State และ Hooks ตั้งแต่ศูนย์ จนสร้างเว็บแอปแรกได้",
    category: "frontend",
    level: "BEGINNER",
    priceBaht: 1290,
    isPublished: true,
    createdDaysAgo: 200,
    lessons: ["แนะนำ React และการติดตั้ง", "JSX และ Component", "Props และการส่งข้อมูล", "State ด้วย useState", "useEffect และการดึงข้อมูล", "Workshop: Todo App"],
  },
  {
    slug: "nextjs-fullstack",
    title: "Next.js 16 Full-Stack",
    summary: "สร้างเว็บ Full-Stack ด้วย App Router, Server Components, Server Actions และ Prisma",
    category: "frontend",
    level: "INTERMEDIATE",
    priceBaht: 2490,
    isPublished: true,
    createdDaysAgo: 30,
    lessons: ["ภาพรวม App Router", "Server และ Client Components", "Routing และ Layout", "ดึงข้อมูลและ Cache", "Server Actions", "เชื่อมฐานข้อมูลด้วย Prisma", "Authentication", "Deploy ขึ้น Production"],
  },
  {
    slug: "typescript-essentials",
    title: "TypeScript Essentials",
    summary: "เขียน JavaScript ให้ปลอดภัยขึ้นด้วยระบบ Type ที่ใช้จริงในงาน",
    category: "frontend",
    level: "BEGINNER",
    priceBaht: 990,
    isPublished: true,
    createdDaysAgo: 150,
    lessons: ["ทำไมต้อง TypeScript", "Type พื้นฐาน", "Interface และ Type Alias", "Generics", "Union และ Narrowing"],
  },
  {
    slug: "tailwind-ui",
    title: "ออกแบบ UI ด้วย Tailwind CSS",
    summary: "จัด Layout, Responsive และ Dark mode อย่างมืออาชีพด้วย Utility-first CSS",
    category: "frontend",
    level: "BEGINNER",
    priceBaht: 790,
    isPublished: true,
    createdDaysAgo: 120,
    lessons: ["แนวคิด Utility-first", "Flexbox และ Grid", "Responsive Design", "Dark mode และ Theme"],
  },
  {
    slug: "nodejs-api",
    title: "สร้าง REST API ด้วย Node.js",
    summary: "ออกแบบและพัฒนา REST API ที่มีโครงสร้างดี ทดสอบได้ และพร้อมใช้งานจริง",
    category: "backend",
    level: "INTERMEDIATE",
    priceBaht: 1590,
    isPublished: true,
    createdDaysAgo: 180,
    lessons: ["ออกแบบ REST API", "Express เบื้องต้น", "Middleware", "Validation ด้วย Zod", "จัดการ Error", "Authentication ด้วย JWT"],
  },
  {
    slug: "prisma-database",
    title: "ฐานข้อมูลกับ Prisma ORM",
    summary: "ออกแบบ Schema, Relation, Transaction และ Repository Pattern ด้วย Prisma",
    category: "backend",
    level: "INTERMEDIATE",
    priceBaht: 1490,
    isPublished: true,
    createdDaysAgo: 60,
    lessons: ["รู้จัก Prisma", "ออกแบบ Schema และ Relation", "CRUD", "Transaction", "Repository Pattern"],
  },
  {
    slug: "unit-testing-vitest",
    title: "Unit Testing ด้วย Vitest",
    summary: "เขียน Unit Test อย่างเป็นระบบ ตั้งแต่ออกแบบ Test Case จนถึง Mock และ Coverage",
    category: "testing",
    level: "BEGINNER",
    priceBaht: 1890,
    isPublished: true,
    createdDaysAgo: 10,
    lessons: ["ทำไมต้องเขียนเทสต์", "ติดตั้ง Vitest", "Equivalence Partitioning", "Boundary Value Analysis", "Test Double: Stub, Spy, Mock", "Fake Timers", "Coverage"],
  },
  {
    slug: "e2e-playwright",
    title: "E2E Testing ด้วย Playwright",
    summary: "ทดสอบเว็บแบบ End-to-End อัตโนมัติ ครอบคลุม Flow สำคัญของผู้ใช้",
    category: "testing",
    level: "INTERMEDIATE",
    priceBaht: 1990,
    isPublished: true,
    createdDaysAgo: 45,
    lessons: ["รู้จัก Playwright", "Locator และ data-testid", "Assertion", "Authentication State", "Mock Network", "รันบน CI"],
  },
  {
    slug: "tdd-workshop",
    title: "TDD Workshop ลงมือจริง",
    summary: "ฝึก Red-Green-Refactor กับโจทย์จริง พร้อมเทคนิค Refactor ให้โค้ดทดสอบง่าย",
    category: "testing",
    level: "ADVANCED",
    priceBaht: 2990,
    isPublished: true,
    createdDaysAgo: 5,
    lessons: ["วงจร Red-Green-Refactor", "Kata: String Calculator", "Dependency Injection", "Repository Pattern กับเทสต์", "Functional Core, Imperative Shell", "Integration Test กับฐานข้อมูล", "Contract Test", "สรุปและแนวทางต่อยอด"],
  },
  {
    slug: "flutter-mobile",
    title: "Flutter สร้างแอปมือถือ",
    summary: "สร้างแอป iOS และ Android จากโค้ดชุดเดียวด้วย Flutter และ Dart",
    category: "mobile",
    level: "BEGINNER",
    priceBaht: 1790,
    isPublished: true,
    createdDaysAgo: 90,
    lessons: ["ติดตั้ง Flutter", "ภาษา Dart เบื้องต้น", "Widget พื้นฐาน", "Layout", "State Management", "เชื่อมต่อ API"],
  },
  {
    slug: "docker-devops",
    title: "Docker สำหรับนักพัฒนา",
    summary: "แพ็กแอปเป็น Container ใช้ Docker Compose และเตรียมระบบให้พร้อม Deploy",
    category: "devops",
    level: "INTERMEDIATE",
    priceBaht: 1290,
    isPublished: true,
    createdDaysAgo: 75,
    lessons: ["Container คืออะไร", "Dockerfile", "Image และ Registry", "Docker Compose", "Best Practices"],
  },
  {
    slug: "git-basic",
    title: "Git และ GitHub เบื้องต้น (ฟรี)",
    summary: "จัดการเวอร์ชันโค้ดด้วย Git และทำงานร่วมกันบน GitHub — เรียนฟรี",
    category: "devops",
    level: "BEGINNER",
    priceBaht: 0,
    isPublished: true,
    createdDaysAgo: 300,
    lessons: ["ติดตั้งและตั้งค่า Git", "Commit และ History", "Branch และ Merge", "Pull Request บน GitHub"],
  },
  {
    slug: "kubernetes-advanced",
    title: "Kubernetes ขั้นสูง",
    summary: "บริหาร Cluster, Autoscaling และ Observability สำหรับระบบขนาดใหญ่ (กำลังจัดทำ)",
    category: "devops",
    level: "ADVANCED",
    priceBaht: 3490,
    isPublished: false,
    createdDaysAgo: 1,
    lessons: ["สถาปัตยกรรม Kubernetes", "Deployment และ Service", "Autoscaling", "Helm", "Monitoring", "Security"],
  },
]

/** วิดีโอสอนเขียนโปรแกรมบน YouTube (ใช้วนเป็นตัวอย่างเท่านั้น) */
export const YOUTUBE_IDS = [
  "PkZNo7MFNFg",
  "W6NZfCO5SIk",
  "SqcY0GlETPk",
  "bMknfKXIFA8",
  "30LWjhZzg50",
  "Oe421EPjeBE",
  "HXV3zeQKqGY",
  "pTFZFxd4hOI",
  "rfscVS0vtbw",
  "7S_tz1z_5bA",
]

export const COUPONS = [
  { code: "WELCOME20", type: "PERCENT", value: 20, maxDiscountSatang: 50000, isActive: true },
  { code: "SAVE200", type: "FIXED", value: 20000, maxDiscountSatang: null, isActive: true },
  { code: "OLDCODE", type: "PERCENT", value: 50, maxDiscountSatang: null, isActive: false },
] as const

export const REVIEW_COMMENTS = [
  "อธิบายเข้าใจง่ายมาก เหมาะกับมือใหม่สุด ๆ",
  "เนื้อหาแน่น ตัวอย่างใช้งานได้จริงในงาน",
  "ชอบ Workshop ท้ายคอร์ส ได้ลงมือทำจริง",
  "คุ้มราคามาก แนะนำให้เพื่อนในทีมแล้ว",
  "บางบทเร็วไปนิด แต่โดยรวมดีมากครับ",
  "เรียนจบแล้วเอาไปใช้กับโปรเจกต์ได้ทันที",
  "ผู้สอนตอบคำถามดี เนื้อหาอัปเดต",
]

export const DEMO_PASSWORD = "password123"
