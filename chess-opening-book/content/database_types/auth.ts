export type UserRole = "admin" | "driver" | "customer";

export type SessionWithUser = {
  user: {
    role?: string | null;
    banned?: boolean | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};