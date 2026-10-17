export type Review = {
  id: number
  userId: string
  userName: string
  courseId: number
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export type ReviewInput = {
  rating: number
  comment: string
}
