const isWrappedResponse = <T>(payload: unknown): payload is { data: T } => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload
  );
};

export const unwrapResponse = <T>(payload: T | { data: T }): T => {
  if (isWrappedResponse<T>(payload)) {
    return payload.data;
  }

  return payload;
};
