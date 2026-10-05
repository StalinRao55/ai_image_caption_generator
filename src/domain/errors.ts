export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  unauthorized: () => new AppError("Invalid session. Please sign in again.", "UNAUTHORIZED", 401),
  forbidden: () => new AppError("You do not have permission to do that.", "FORBIDDEN", 403),
  noImage: () => new AppError("Please upload an image first.", "NO_IMAGE", 400),
  unsupportedFile: () => new AppError("Unsupported file. Use PNG, JPEG, WEBP, or GIF.", "UNSUPPORTED_FILE", 400),
  fileTooLarge: () => new AppError("Image must be 20 MB or smaller.", "FILE_TOO_LARGE", 400),
  lowCredits: () => new AppError("Credits are low. Upgrade your plan to continue.", "LOW_CREDITS", 402),
  rateLimit: () => new AppError("Too many requests. Please wait a moment.", "RATE_LIMIT", 429),
  timeout: () => new AppError("The AI request timed out. Try again.", "API_TIMEOUT", 504),
  network: () => new AppError("Network error. Check your connection.", "NETWORK", 503),
  notFound: (entity = "Resource") => new AppError(`${entity} not found.`, "NOT_FOUND", 404),
  config: (msg: string) => new AppError(msg, "CONFIG", 500),
};
