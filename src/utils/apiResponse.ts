export function unwrapResponse<T>(response: T | Common.ResponseStructure<T>): T {
  const wrapped = response as Common.ResponseStructure<T>;

  if (wrapped && typeof wrapped === 'object' && 'success' in wrapped && 'data' in wrapped) {
    return wrapped.data;
  }

  return response as T;
}
