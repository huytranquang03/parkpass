export interface ApiError {
  code: string; // ví dụ 'VALIDATION_ERROR', 'UNAUTHORIZED'
  message: string;
  fieldErrors?: Record<string, string>; // chỉ có ở 422
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(status: number, apiError: ApiError) {
    super(apiError.message);

    this.name = "ApiRequestError";
    this.status = status;
    this.code = apiError.code;
    this.fieldErrors = apiError.fieldErrors;
  }
}
