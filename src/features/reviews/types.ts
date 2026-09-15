export interface Review {
  id: string;
  attractionId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO 8601
}
