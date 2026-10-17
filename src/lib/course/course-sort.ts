import type { CatalogSort } from "./catalog-params"
import type { CourseSummary } from "./course-types"

/**
 * เรียงคอร์สตามตัวเลือก (pure — ไม่แก้ array เดิม)
 * rating: คอร์สที่ยังไม่มีรีวิวไปอยู่ท้ายสุด, คะแนนเท่ากันให้คอร์สที่มีรีวิวมากกว่าขึ้นก่อน
 */
export function sortCourses(courses: readonly CourseSummary[], sort: CatalogSort): CourseSummary[] {
  const list = [...courses]
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.priceSatang - b.priceSatang || a.id - b.id)
    case "price-desc":
      return list.sort((a, b) => b.priceSatang - a.priceSatang || a.id - b.id)
    case "rating":
      return list.sort((a, b) => {
        const ra = a.averageRating ?? -1
        const rb = b.averageRating ?? -1
        return rb - ra || b.reviewCount - a.reviewCount || a.id - b.id
      })
    case "newest":
    default:
      return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id)
  }
}
