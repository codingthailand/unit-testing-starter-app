export type Certificate = {
  id: number
  code: string
  userId: string
  courseId: number
  issuedAt: Date
}

export type CertificateView = Certificate & {
  userName: string
  courseTitle: string
  courseSlug: string
  totalMinutes: number
}
