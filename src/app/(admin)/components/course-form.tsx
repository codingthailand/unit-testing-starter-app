"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Category, CourseDetail } from "@/lib/course/course-types";
import type { ActionState } from "@/lib/shared/action-state";
import { satangToBaht } from "@/lib/shared/money";
import { COURSE_LEVEL_LABELS, COURSE_LEVELS } from "@/lib/shared/status";
import { FormField, selectClass } from "./form-field";

type CourseFormProps<T> = {
  categories: Category[];
  course?: CourseDetail;
  action: (prev: ActionState<T> | null, formData: FormData) => Promise<ActionState<T>>;
  submitLabel: string;
};

export default function CourseForm<T>({ categories, course, action, submitLabel }: CourseFormProps<T>) {
  const [state, formAction, pending] = useActionState<ActionState<T> | null, FormData>(action, null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 rounded-xl border bg-card p-6" data-testid="course-form">
      <FieldGroup className="grid gap-6 md:grid-cols-2">
        <FormField errors={errors} label="ชื่อคอร์ส" name="title">
          <Input data-testid="course-title-input" defaultValue={course?.title} id="title" name="title" />
        </FormField>
        <FormField description="ใช้ใน URL เช่น react-basic" errors={errors} label="Slug" name="slug">
          <Input data-testid="course-slug-input" defaultValue={course?.slug} id="slug" name="slug" />
        </FormField>
        <FormField errors={errors} label="หมวดหมู่" name="categoryId">
          <select className={selectClass} data-testid="course-category-input" defaultValue={course?.category.id ?? ""} id="categoryId" name="categoryId">
            <option disabled value="">
              เลือกหมวดหมู่
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField errors={errors} label="ระดับ" name="level">
          <select className={selectClass} data-testid="course-level-input" defaultValue={course?.level ?? "BEGINNER"} id="level" name="level">
            {COURSE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {COURSE_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField description="0 = คอร์สฟรี" errors={errors} label="ราคา (บาท)" name="priceBaht">
          <Input
            data-testid="course-price-input"
            defaultValue={course ? satangToBaht(course.priceSatang) : ""}
            id="priceBaht"
            inputMode="decimal"
            name="priceBaht"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField description="ไฟล์ใน public/course-image" errors={errors} label="ชื่อไฟล์รูปปก" name="imageName">
          <Input data-testid="course-image-input" defaultValue={course?.imageName ?? "react-fundamentals.svg"} id="imageName" name="imageName" />
        </FormField>
      </FieldGroup>
      <FormField errors={errors} label="คำโปรย" name="summary">
        <Input data-testid="course-summary-input" defaultValue={course?.summary} id="summary" name="summary" />
      </FormField>
      <FormField errors={errors} label="รายละเอียด" name="description">
        <Textarea data-testid="course-description-input" defaultValue={course?.description} id="description" name="description" rows={5} />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input
          className="size-4 accent-primary"
          data-testid="course-published-input"
          defaultChecked={course?.isPublished ?? true}
          name="isPublished"
          type="checkbox"
        />
        เผยแพร่ (แสดงในหน้าเว็บและเปิดขาย)
      </label>
      <Button data-testid="course-submit" disabled={pending} type="submit">
        {submitLabel}
      </Button>
    </form>
  );
}
