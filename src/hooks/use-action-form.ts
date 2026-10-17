"use client"

import { startTransition, type FormEvent } from "react"

/**
 * ส่ง FormData เข้า action ของ useActionState ผ่าน onSubmit แทน <form action>
 * เพราะ React 19 จะ reset ฟอร์มทุกครั้งหลัง action จบ — ผู้ใช้จะเสียข้อมูลที่กรอกไว้เมื่อ validation ไม่ผ่าน
 */
export function useActionFormSubmit(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => formAction(formData))
  }
}
