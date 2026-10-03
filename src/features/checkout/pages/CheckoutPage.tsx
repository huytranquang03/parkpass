import { useRef, useState, type SubmitEvent } from "react";
import styles from "./CheckoutPage.module.css";
import TicketSummaryCard from "../components/TicketSummaryCard";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/authContext";
import type { CreateOrderRequest } from "@/features/orders/types";
import { ApiRequestError } from "@/lib/apiError";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/features/orders/api";
import { selectTotalPrice, useCartStore } from "@/features/cart/cartStore";

interface CheckoutFormValues {
  fullName: string;
  email: string;
  phone: string;
  visitDate: string;
  promoCode: string;
  acceptTerms: boolean;
}

interface CheckoutFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  visitDate?: string;
  promoCode?: string;
  acceptTerms?: string;
}

type TextFieldName = "fullName" | "email" | "phone" | "visitDate" | "promoCode";

const INITIAL_FORM_VALUES: CheckoutFormValues = {
  fullName: "",
  email: "",
  phone: "",
  visitDate: "",
  promoCode: "",
  acceptTerms: false,
};

export default function CheckoutPage() {
  const [values, setValues] = useState<CheckoutFormValues>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // const { items, totalPrice, dispatch } = useCart();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore(selectTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const { token } = useAuth();
  const navigate = useNavigate();

  const createOrderMutation = useMutation({
    mutationFn: (requestBody: CreateOrderRequest) => {
      if (!token) {
        throw new Error("Phiên đăng nhập không hợp lệ");
      }
      return createOrder(requestBody, token);
    },
  });

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const visitDateRef = useRef<HTMLInputElement>(null);
  const promoCodeRef = useRef<HTMLInputElement>(null);
  const acceptTermsRef = useRef<HTMLInputElement>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let submitButtonText = "Xác nhận đặt vé";

  if (isCheckingPromo) {
    submitButtonText = "Đang kiểm tra mã...";
  } else if (createOrderMutation.isPending) {
    submitButtonText = "Đang tạo đơn...";
  }

  function handleTextChange(field: TextFieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    if (field === "promoCode") {
      setPromoMessage(null);
      setErrors((current) => ({
        ...current,
        promoCode: undefined,
      }));
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCheckingPromo || createOrderMutation.isPending) return;

    const nextErrors: CheckoutFormErrors = {};
    if (!values.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên";
    }
    if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = "Email không hợp lệ";
    }
    const normalizedPhone = values.phone.replace(/[\s().-]/g, "");

    if (!/^(?:0|\+84)(?:[35789]\d{8}|2\d{9})$/.test(normalizedPhone)) {
      nextErrors.phone = "Số điện thoại Việt Nam không hợp lệ";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestDate = new Date(today);
    latestDate.setDate(latestDate.getDate() + 90);

    const visitDate = new Date(`${values.visitDate}T00:00:00`);

    if (!values.visitDate || Number.isNaN(visitDate.getTime())) {
      nextErrors.visitDate = "Vui lòng chọn ngày tham quan";
    } else if (visitDate < today) {
      nextErrors.visitDate = "Ngày tham quan không được ở quá khứ";
    } else if (visitDate > latestDate) {
      nextErrors.visitDate = "Ngày tham quan phải trong vòng 90 ngày tới";
    }

    if (!values.acceptTerms) {
      nextErrors.acceptTerms = "Bạn cần đồng ý với điều khoản";
    }

    setErrors(nextErrors);

    if (nextErrors.fullName) {
      fullNameRef.current?.focus();
      return;
    }

    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }

    if (nextErrors.visitDate) {
      visitDateRef.current?.focus();
      return;
    }

    if (nextErrors.acceptTerms) {
      acceptTermsRef.current?.focus();
      return;
    }

    const code = values.promoCode.trim().toUpperCase();

    if (code) {
      setIsCheckingPromo(true);
      setPromoMessage(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/promo-codes/${encodeURIComponent(code)}`,
        );
        if (response.status === 404) {
          throw new Error("Mã khuyến mãi không tồn tại");
        }
        if (!response.ok) {
          throw new Error("Không kiểm tra được mã. Vui lòng thử lại");
        }
        setPromoMessage("Mã khuyến mãi hợp lệ");
      } catch (error) {
        let message: string;
        if (error instanceof Error) {
          message = error.message;
        } else {
          message = "Không kiểm tra được mã";
        }
        setErrors((current) => ({ ...current, promoCode: message }));
        promoCodeRef.current?.focus();
        return;
      } finally {
        setIsCheckingPromo(false);
      }
    } else {
      setPromoMessage(null);
    }

    if (!token) {
      setSubmitError("Phiên đăng nhập không hợp lệ");
      return;
    }

    const requestBody: CreateOrderRequest = {
      items: items.map((item) => ({
        attractionId: item.attractionId,
        ticketType: item.ticketType,
        quantity: item.quantity,
      })),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: normalizedPhone,
      visitDate: values.visitDate,
      acceptTerms: values.acceptTerms,
    };
    if (code) {
      requestBody.promoCode = code;
    }

    // setIsSubmitting(true);
    // setSubmitError(null);

    // try {
    //   const response = await fetch(
    //     `${import.meta.env.VITE_API_BASE_URL}/orders`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-type": "application/json",
    //         Authorization: `Bearer ${token}`,
    //       },
    //       body: JSON.stringify(requestBody),
    //     },
    //   );

    //   const result = (await response.json()) as Order | ApiError;

    //   if (response.status === 422) {
    //     const apiError = result as ApiError;
    //     const fieldErrors = (apiError.fieldErrors ?? {}) as CheckoutFormErrors;

    //     setErrors(fieldErrors);
    //     if (fieldErrors.fullName) fullNameRef.current?.focus();
    //     else if (fieldErrors.email) emailRef.current?.focus();
    //     else if (fieldErrors.phone) phoneRef.current?.focus();
    //     else if (fieldErrors.visitDate) visitDateRef.current?.focus();
    //     else if (fieldErrors.promoCode) promoCodeRef.current?.focus();
    //     else if (fieldErrors.acceptTerms) acceptTermsRef.current?.focus();
    //     return;
    //   }

    //   if (!response.ok) {
    //     const apiError = result as ApiError;
    //     throw new Error(apiError.message || "Không thể tạo đơn hàng");
    //   }

    //   const order = result as Order;
    //   dispatch({ type: "CLEAR_CART" });
    //   navigate(`/orders/${order.id}`, {
    //     replace: true,
    //     state: { successMessage: "Đặt vé thành công" },
    //   });
    // } catch (error) {
    //   if (error instanceof Error) {
    //     setSubmitError(error.message);
    //   } else {
    //     setSubmitError("Không thể tạo đơn hàng");
    //   }
    //   return;
    // } finally {
    //   setIsSubmitting(false);
    // }

    // createOrderMutation.mutate(requestBody, {
    //   onSuccess: (order) => {
    //     dispatch({ type: "CLEAR_CART" });
    //   onError: (error) => {
    //     if (error instanceof ApiRequestError && error.status === 422) {
    // });

    setSubmitError(null);

    try {
      const order = await createOrderMutation.mutateAsync(requestBody);

      // dispatch({ type: "CLEAR_CART" });
      clearCart();

      navigate(`/orders/${order.id}`, {
        replace: true,
        state: { successMessage: "Đặt vé thành công" },
      });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 422) {
        const fieldErrors = (error.fieldErrors ?? {}) as CheckoutFormErrors;

        setErrors(fieldErrors);
        if (fieldErrors.fullName) fullNameRef.current?.focus();
        else if (fieldErrors.email) emailRef.current?.focus();
        else if (fieldErrors.phone) phoneRef.current?.focus();
        else if (fieldErrors.visitDate) visitDateRef.current?.focus();
        else if (fieldErrors.promoCode) promoCodeRef.current?.focus();
        else if (fieldErrors.acceptTerms) acceptTermsRef.current?.focus();
        return;
      }

      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Không thể tạo đơn hàng");
      }
    }
  }

  if (items.length === 0) {
    return (
      <section className={styles.page}>
        <h1>Thông tin đặt vé</h1>
        <p role="status">Giỏ hàng đang trống. Hãy chọn vé trước khi đặt.</p>
        <Link to="/">Xem danh sách trải nghiệm</Link>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <h1>Thông tin đặt vé</h1>
      <TicketSummaryCard items={items} totalPrice={totalPrice} />
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="full-name">Họ và tên</label>
          <input
            id="full-name"
            name="fullName"
            ref={fullNameRef}
            type="text"
            value={values.fullName}
            onChange={(event) =>
              handleTextChange("fullName", event.currentTarget.value)
            }
          />
          {errors.fullName && (
            <p id="full-name-error" className={styles.error}>
              {errors.fullName}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            ref={emailRef}
            type="email"
            value={values.email}
            onChange={(event) =>
              handleTextChange("email", event.currentTarget.value)
            }
          />
          {errors.email && (
            <p className={styles.error} id="email-error">
              {errors.email}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="phone">Số điện thoại</label>
          <input
            id="phone"
            name="phone"
            ref={phoneRef}
            type="tel"
            value={values.phone}
            onChange={(event) =>
              handleTextChange("phone", event.currentTarget.value)
            }
          />
          {errors.phone && (
            <p className={styles.error} id="phone-error">
              {errors.phone}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="visit-date">Ngày tham quan</label>
          <input
            id="visit-date"
            name="visitDate"
            ref={visitDateRef}
            type="date"
            value={values.visitDate}
            onChange={(event) =>
              handleTextChange("visitDate", event.currentTarget.value)
            }
          />
          {errors.visitDate && (
            <p className={styles.error} id="visit-date-error">
              {errors.visitDate}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="promo-code">Mã khuyến mãi (không bắt buộc)</label>
          <input
            id="promo-code"
            name="promoCode"
            ref={promoCodeRef}
            disabled={isCheckingPromo}
            type="text"
            value={values.promoCode}
            onChange={(event) =>
              handleTextChange("promoCode", event.currentTarget.value)
            }
          />
          {errors.promoCode && (
            <p id="promo-code-error" className={styles.error}>
              {errors.promoCode}
            </p>
          )}

          {promoMessage && <p role="status">{promoMessage}</p>}
        </div>
        <label className={styles.terms}>
          <input
            id="acceptTerms"
            name="acceptTerms"
            ref={acceptTermsRef}
            type="checkbox"
            checked={values.acceptTerms}
            onChange={(event) => {
              const checked = event.currentTarget.checked;
              setValues((currentValue) => ({
                ...currentValue,
                acceptTerms: checked,
              }));
            }}
          />
          Tôi đồng ý với điều khoản
        </label>
        {errors.acceptTerms && (
          <p className={styles.error} id="accept-terms-error">
            {errors.acceptTerms}
          </p>
        )}
        {submitError && <p role="alert">{submitError}</p>}
        <Button
          type="submit"
          disabled={isCheckingPromo || createOrderMutation.isPending}
        >
          {submitButtonText}
        </Button>
      </form>
    </section>
  );
}
