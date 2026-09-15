import type { Attraction, Category } from "@/features/attractions/types";
import { parks } from "./parks";
import { isMockFlagEnabled } from "../mockStorage";

const categories: Category[] = ["THRILL", "FAMILY", "KIDS", "SHOW", "WATER"];

function getCycledItem<T>(items: T[], index: number): T {
  const item = items[index % items.length];
  if (item === undefined) {
    throw new Error("Cannot select an item from an empty array");
  }
  return item;
}

function generateAttractions(count: number): Attraction[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const park = getCycledItem(parks, index);
    const category = getCycledItem(categories, index);
    const basePrice = 200_000 + index * 10_000;

    return {
      id: `attraction-${number}`,
      name: `Attraction ${number}`,
      parkId: park.id,
      category,
      description: `A ${category.toLowerCase()} attraction at ${park.name}.`,
      images: [`https://placehold.co/600x400?text=Attraction+${number}`],
      rating: 3 + (index % 20) / 10,
      prices: {
        ADULT: basePrice,
        CHILD: Math.round(basePrice * 0.7),
        SENIOR: Math.round(basePrice * 0.8),
      },
    };
  });
}

export const attractions = generateAttractions(30);
const largeAttractions = generateAttractions(500);

export function getAttractions(): Attraction[] {
  return isMockFlagEnabled("pp:large") ? largeAttractions : attractions;
}
