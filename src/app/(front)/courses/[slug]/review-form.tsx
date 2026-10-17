"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { reviewSchema, type ReviewFormValues } from "@/lib/validation/review-schema";
import { submitReviewAction } from "./actions";

type ReviewFormProps = {
  courseId: number;
  slug: string;
  initial: { rating: number; comment: string } | null;
};

export default function ReviewForm({ courseId, slug, initial }: ReviewFormProps) {
  const router = useRouter();
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: initial?.rating ?? 0, comment: initial?.comment ?? "" },
  });

  async function onSubmit(values: ReviewFormValues) {
    const result = await submitReviewAction({
      courseId,
      slug,
      rating: Number(values.rating),
      comment: String(values.comment),
    });
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form className="rounded-xl border bg-card p-5" data-testid="review-form" onSubmit={form.handleSubmit(onSubmit)}>
      <h3 className="font-semibold">{initial ? "แก้ไขรีวิวของคุณ" : "เขียนรีวิว"}</h3>
      <FieldGroup className="mt-4">
        <Controller
          control={form.control}
          name="rating"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>ให้คะแนน</FieldLabel>
              <div className="flex gap-1" role="radiogroup">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-checked={Number(field.value) === value}
                    aria-label={`${value} ดาว`}
                    data-testid={`review-star-${value}`}
                    key={value}
                    onClick={() => field.onChange(value)}
                    role="radio"
                    type="button"
                  >
                    <Star
                      className={cn(
                        "size-7 transition",
                        value <= Number(field.value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="comment"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="review-comment">ความคิดเห็น</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                data-testid="review-comment"
                id="review-comment"
                placeholder="คอร์สนี้ช่วยคุณอย่างไรบ้าง (อย่างน้อย 10 ตัวอักษร)"
                rows={4}
                value={String(field.value ?? "")}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="mt-4" data-testid="review-submit" disabled={form.formState.isSubmitting} type="submit">
        {initial ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
      </Button>
    </form>
  );
}
