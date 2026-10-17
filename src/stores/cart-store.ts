"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { CartItem } from "@/types/cart"

/**
 * ตะกร้าเก็บใน localStorage — ราคาในนี้ใช้แสดงผลเท่านั้น
 * ตอน checkout server คำนวณราคาใหม่จาก DB เสมอ
 *
 * reducer ด้านล่างเป็น pure function แยกจาก zustand เพื่อให้เทสต์ได้โดยไม่ต้องใช้ React
 */
export type CartState = {
  items: CartItem[]
  /** โค้ดคูปองที่ผู้ใช้กรอกไว้ (ตรวจจริงที่ server ตอนคำนวณราคา) */
  couponCode: string | null
}

export const initialCartState: CartState = { items: [], couponCode: null }

/** คอร์สเดียวกันอยู่ในตะกร้าได้แค่ 1 รายการ */
export function addItem(state: CartState, item: CartItem): CartState {
  if (state.items.some((current) => current.courseId === item.courseId)) return state
  return { ...state, items: [...state.items, item] }
}

export function removeItem(state: CartState, courseId: number): CartState {
  if (!state.items.some((item) => item.courseId === courseId)) return state
  return { ...state, items: state.items.filter((item) => item.courseId !== courseId) }
}

export function clearCart(): CartState {
  return { items: [], couponCode: null }
}

/** ค่าว่างหรือช่องว่างล้วน = ไม่ใช้คูปอง */
export function setCouponCode(state: CartState, code: string | null): CartState {
  const trimmed = code?.trim() ?? ""
  return { ...state, couponCode: trimmed === "" ? null : trimmed }
}

export function cartSubtotal(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.priceSatang, 0)
}

export function cartCourseIds(state: CartState): number[] {
  return state.items.map((item) => item.courseId)
}

type CartStore = CartState & {
  add: (item: CartItem) => void
  remove: (courseId: number) => void
  clear: () => void
  setCoupon: (code: string | null) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ...initialCartState,
      add: (item) => set((state) => addItem(state, item)),
      remove: (courseId) => set((state) => removeItem(state, courseId)),
      clear: () => set(clearCart()),
      setCoupon: (code) => set((state) => setCouponCode(state, code)),
    }),
    {
      name: "course-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
    }
  )
)
