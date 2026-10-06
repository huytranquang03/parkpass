import { describe, expect, it } from "vitest";
import { getVisitDate } from "@/test/orderFixtures";
import { checkoutSchema } from "./checkoutSchema";

const validFormValues = {
  fullName: "Demo User",
  email: "demo@parkpass.dev",
  phone: "0901234567",
  visitDate: getVisitDate(),
  promoCode: "",
  acceptTerms: true,
};

describe("checkoutSchema", () => {
  it("accepts valid checkout values and trims text fields", () => {
    const result = checkoutSchema.parse({
      ...validFormValues,
      fullName: "  Demo User  ",
      email: "  demo@parkpass.dev  ",
      phone: "090 123 4567",
    });

    expect(result.fullName).toBe("Demo User");
    expect(result.email).toBe("demo@parkpass.dev");
  });

  it.each([
    ["fullName", { fullName: "" }, "Vui lòng nhập họ và tên"],
    ["email", { email: "invalid" }, "Email không hợp lệ"],
    ["phone", { phone: "123" }, "Số điện thoại Việt Nam không hợp lệ"],
    ["acceptTerms", { acceptTerms: false }, "Bạn cần đồng ý với điều khoản"],
  ] as const)(
    "reports a validation error for %s",
    (field, override, message) => {
      const result = checkoutSchema.safeParse({
        ...validFormValues,
        ...override,
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.flatten().fieldErrors[field]).toContain(message);
    },
  );

  it.each([
    ["", "Vui lòng chọn ngày tham quan"],
    ["2026-02-31", "Ngày tham quan không hợp lệ"],
    [getVisitDate(-1), "Ngày tham quan không được ở quá khứ"],
    [getVisitDate(91), "Ngày tham quan phải trong vòng 90 ngày tới"],
  ])("rejects visit date %s", (visitDate, message) => {
    const result = checkoutSchema.safeParse({
      ...validFormValues,
      visitDate,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors.visitDate).toContain(message);
  });

  it("accepts a visit date exactly 90 days from today", () => {
    const result = checkoutSchema.safeParse({
      ...validFormValues,
      visitDate: getVisitDate(90),
    });

    expect(result.success).toBe(true);
  });
});
