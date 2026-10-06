import { z } from "zod";

const VIETNAMESE_PHONE_REGEX = /^(?:0|\+84)(?:[35789]\d{8}|2\d{9})$/;

function getVisitDateError(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Vui lòng chọn ngày tham quan";
  }

  const [year, month, day] = value.split("-").map((value) => Number(value));

  if (year === undefined || month === undefined || day === undefined) {
    return "Ngày tham quan không hợp lệ";
  }

  const visitDate = new Date(year, month - 1, day);

  const isInvalidDate =
    visitDate.getFullYear() !== year ||
    visitDate.getMonth() !== month - 1 ||
    visitDate.getDate() !== day;
  // ngày không hợp lệ có thể bị tự động đẩy sang tháng tiếp theo. new Date(2026, 12, 1);

  if (isInvalidDate) {
    return "Ngày tham quan không hợp lệ";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestDate = new Date(today);
  latestDate.setDate(latestDate.getDate() + 90);

  if (visitDate < today) {
    return "Ngày tham quan không được ở quá khứ";
  }

  if (visitDate > latestDate) {
    return "Ngày tham quan phải trong vòng 90 ngày tới";
  }
}

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),

  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Email không hợp lệ" })),

  phone: z
    .string()
    .refine(
      (value) => VIETNAMESE_PHONE_REGEX.test(value.replace(/[\s().-]/g, "")),
      {
        message: "Số điện thoại Việt Nam không hợp lệ",
      },
    ),

  visitDate: z.string().superRefine((value, context) => {
    const message = getVisitDateError(value);
    if (message) {
      context.addIssue({
        code: "custom",
        message,
      });
    }
  }),

  promoCode: z.string(),

  acceptTerms: z.boolean().refine((value) => value, {
    message: "Bạn cần đồng ý với điều khoản",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
