interface PromoCode {
  code: string;
  discountPercent: number;
}

export const promoCodes: PromoCode[] = [
  {
    code: "WELCOME10",
    discountPercent: 10,
  },
  {
    code: "SUMMER15",
    discountPercent: 15,
  },
  {
    code: "FAMILY20",
    discountPercent: 20,
  },
];
