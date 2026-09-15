export interface ApiError {
  code: string; // ví dụ 'VALIDATION_ERROR', 'UNAUTHORIZED'
  message: string;
  fieldErrors?: Record<string, string>; // chỉ có ở 422
}
