import { COURSE_LEVELS, isOneOf, type CourseLevel } from "@/lib/shared/status"

export const CATALOG_SORTS = ["newest", "price-asc", "price-desc", "rating"] as const
export type CatalogSort = (typeof CATALOG_SORTS)[number]

export const DEFAULT_SORT: CatalogSort = "newest"
export const MAX_QUERY_LENGTH = 100

export type CatalogParams = {
  q: string
  category: string | undefined
  level: CourseLevel | undefined
  sort: CatalogSort
}

type RawParam = string | string[] | undefined

/** ค่า searchParams อาจเป็น array (เช่น ?q=a&q=b) ให้ใช้ค่าแรก */
function first(value: RawParam): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * แปลง searchParams ของหน้า /courses ให้เป็นค่าที่ปลอดภัย (pure)
 * ค่าที่ไม่รู้จักจะถูกละทิ้ง ไม่ throw — ผู้ใช้พิมพ์ URL มั่วก็ยังเห็นหน้าได้
 */
export function parseCatalogParams(raw: Record<string, RawParam>): CatalogParams {
  const q = (first(raw.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH)

  const categoryRaw = first(raw.category)?.trim()
  const category = categoryRaw ? categoryRaw : undefined

  const levelRaw = first(raw.level)
  const level = isOneOf(COURSE_LEVELS, levelRaw) ? levelRaw : undefined

  const sortRaw = first(raw.sort)
  const sort = isOneOf(CATALOG_SORTS, sortRaw) ? sortRaw : DEFAULT_SORT

  return { q, category, level, sort }
}

/** สร้าง query string กลับจาก params (ไม่ใส่ค่า default) — ใช้กับลิงก์ตัวกรอง */
export function toCatalogQueryString(params: Partial<CatalogParams>): string {
  const search = new URLSearchParams()
  if (params.q) search.set("q", params.q)
  if (params.category) search.set("category", params.category)
  if (params.level) search.set("level", params.level)
  if (params.sort && params.sort !== DEFAULT_SORT) search.set("sort", params.sort)
  const text = search.toString()
  return text ? `?${text}` : ""
}
