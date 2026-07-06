export function genMockOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}
