"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * true เมื่อ render บน browser แล้ว — ใช้กับข้อมูลจาก localStorage (ตะกร้า)
 * เพื่อไม่ให้ HTML จาก server กับ client ไม่ตรงกัน (hydration mismatch)
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
