import { test, expect } from "vitest";

test("returns the park list", async () => {
  const response = await fetch("http://localhost/api/parks");
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveLength(4);
  expect(data[0]).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      city: expect.any(String),
    }),
  );
});

test("returns the attraction list", async () => {
  const response = await fetch("http://localhost/api/attractions");
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.data).toHaveLength(12);
  expect(data.total).toBe(30);
  expect(data.page).toBe(1);
  expect(data.limit).toBe(12);
});

test("returns an attraction by id", async () => {
  const response = await fetch("http://localhost/api/attractions/attraction-1");
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body).toEqual(
    expect.objectContaining({
      id: "attraction-1",
      name: expect.any(String),
      prices: expect.any(Object),
      images: expect.any(Array),
    }),
  );
});

test("returns 404 when attraction does not exist", async () => {
  const response = await fetch("http://localhost/api/attractions/not-found");
  expect(response.status).toBe(404);
  const body = await response.json();
  expect(body.code).toBe("ATTRACTION_NOT_FOUND");
  expect(body.message).toBe("Attraction not found");
});

test("paginates the attraction list", async () => {
  const response = await fetch(
    "http://localhost/api/attractions?page=2&limit=5",
  );
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.data).toHaveLength(5);
  expect(body.page).toBe(2);
  expect(body.limit).toBe(5);
  expect(body.data[0].id).toBe("attraction-6");
});

test("searches attractions by name", async () => {
  const response = await fetch(
    "http://localhost/api/attractions?q=ATTRACTION%2030",
  );
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(1);
  expect(body.data).toHaveLength(1);
  expect(body.data[0].id).toBe("attraction-30");
});

test("filters attractions by park", async () => {
  const response = await fetch("http://localhost/api/attractions?park=park-2");
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(8);
  expect(body.data).toHaveLength(8);
  for (const attraction of body.data) {
    expect(attraction.parkId).toBe("park-2");
  }
});

test("combines search and park filters", async () => {
  const response = await fetch(
    "http://localhost/api/attractions?q=30&park=park-1",
  );
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(0);
  expect(body.data).toEqual([]);
});

test("filters attractions by multiple categories", async () => {
  const response = await fetch(
    "http://localhost/api/attractions?category=THRILL&category=WATER",
  );

  expect(response.status).toBe(200);

  const body = await response.json();

  expect(body.total).toBe(12);
  expect(body.data).toHaveLength(12);

  for (const attraction of body.data) {
    expect(["THRILL", "WATER"]).toContain(attraction.category);
  }
});

test("combines park and category filters", async () => {
  const response = await fetch(
    "http://localhost/api/attractions?park=park-2&category=THRILL&category=WATER",
  );

  expect(response.status).toBe(200);

  const body = await response.json();

  expect(body.total).toBe(4);
  expect(body.data).toHaveLength(4);

  for (const attraction of body.data) {
    expect(attraction.parkId).toBe("park-2");
    expect(["THRILL", "WATER"]).toContain(attraction.category);
  }
});

test.each([
  {
    sort: "price_asc",
    expectedIds: ["attraction-1", "attraction-2", "attraction-3"],
  },
  {
    sort: "price_desc",
    expectedIds: ["attraction-30", "attraction-29", "attraction-28"],
  },
  {
    sort: "rating_desc",
    expectedIds: ["attraction-20", "attraction-19", "attraction-18"],
  },
])(
  "sorts attractions by $sort before pagination",
  async ({ sort, expectedIds }) => {
    const response = await fetch(
      `http://localhost/api/attractions?sort=${sort}&limit=3`,
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.total).toBe(30);
    expect(body.data).toEqual(
      expectedIds.map((id) => expect.objectContaining({ id })),
    );
  },
);

test("combines filters, sorting, and pagination", async () => {
  const response = await fetch(
    "http://localhost/api/attractions?park=park-2&category=THRILL&category=WATER&sort=price_desc&page=2&limit=2",
  );

  expect(response.status).toBe(200);

  const body = await response.json();

  expect(body.total).toBe(4);
  expect(body.page).toBe(2);
  expect(body.limit).toBe(2);
  expect(body.data).toEqual([
    expect.objectContaining({ id: "attraction-10" }),
    expect.objectContaining({ id: "attraction-6" }),
  ]);
});

test("sorting does not change the default seed order", async () => {
  await fetch("http://localhost/api/attractions?sort=price_desc&limit=1");

  const response = await fetch("http://localhost/api/attractions?limit=1");

  expect(response.status).toBe(200);

  const body = await response.json();

  expect(body.data).toEqual([expect.objectContaining({ id: "attraction-1" })]);
});
