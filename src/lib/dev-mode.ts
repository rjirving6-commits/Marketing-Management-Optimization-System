export function isDevMode(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true";
}

export function shouldUseMockData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
    !process.env.POSTGRES_URL
  );
}

export const mockUser = {
  id: "dev-user-001",
  name: "Dev User",
  email: "dev@rampright.io",
  image: null,
} as const;
