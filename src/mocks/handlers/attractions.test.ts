import { expect, test } from "vitest";
import type { Attraction } from "@/features/attractions/types";

const listUrl = "http://localhost/api/attractions";

test("serves all 500 attractions when large mode and limit 500 are enabled", async () => {
  localStorage.setItem("pp:large", "1");
  const response = await fetch(`${listUrl}?limit=500`);
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(500);
  expect(body.limit).toBe(500);
  expect(body.data).toHaveLength(500);
  expect(body.data[499].id).toBe("attraction-500");
});

test("keeps default pagination at 12 in large mode", async () => {
  localStorage.setItem("pp:large", "1");
  const body = await (await fetch(listUrl)).json();
  expect(body.total).toBe(500);
  expect(body.limit).toBe(12);
  expect(body.data).toHaveLength(12);
});

test("caps the requested limit at 500", async () => {
  localStorage.setItem("pp:large", "1");
  const body = await (await fetch(`${listUrl}?limit=999`)).json();
  expect(body.limit).toBe(500);
  expect(body.data).toHaveLength(500);
});

test("uses large mode consistently for search and detail", async () => {
  localStorage.setItem("pp:large", "1");
  const list = await (await fetch(`${listUrl}?q=Attraction%20500`)).json();
  expect(list.total).toBe(1);
  expect(list.data[0].id).toBe("attraction-500");
  const detail = await fetch(`${listUrl}/attraction-500`);
  expect(detail.status).toBe(200);
  await expect(detail.json()).resolves.toEqual(list.data[0]);
});

test("keeps park/category filters and sorting working across 500 attractions", async () => {
  localStorage.setItem("pp:large", "1");
  const body = await (
    await fetch(
      `${listUrl}?park=park-2&category=THRILL&category=WATER&sort=price_desc&limit=500`,
    )
  ).json();
  expect(body.total).toBe(50);
  expect(body.data).toHaveLength(50);
  expect(
    body.data.every(
      (item: Attraction) =>
        item.parkId === "park-2" && ["THRILL", "WATER"].includes(item.category),
    ),
  ).toBe(true);
  expect(body.data.slice(0, 2).map((item: Attraction) => item.id)).toEqual([
    "attraction-490",
    "attraction-486",
  ]);
});

test("switches back to the 30-item dataset without restarting", async () => {
  localStorage.setItem("pp:large", "1");
  expect((await (await fetch(listUrl)).json()).total).toBe(500);
  localStorage.removeItem("pp:large");
  expect((await (await fetch(listUrl)).json()).total).toBe(30);
  expect((await fetch(`${listUrl}/attraction-500`)).status).toBe(404);
});

test.each(["0", "-1", "1.5", "NaN", "100000000000000000000"])(
  "falls back to defaults for invalid pagination: %s",
  async (value) => {
    const body = await (
      await fetch(`${listUrl}?page=${value}&limit=${value}`)
    ).json();
    expect(body.page).toBe(1);
    expect(body.limit).toBe(12);
    expect(body.data).toHaveLength(12);
  },
);
