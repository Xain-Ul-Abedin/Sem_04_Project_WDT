/**
 * Standard API Response Wrapper
 * Ensures all API responses follow a consistent { success, message, data } format.
 * Used by controllers to send structured responses.
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static ok(res, message, data = null) {
    return res.status(200).json(new ApiResponse(200, message, data));
  }

  static created(res, message, data = null) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }

  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated response for list endpoints
   */
  static paginated(res, message, data, pagination) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

export default ApiResponse;
