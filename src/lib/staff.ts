import type { StaffUser } from "./types";

export type StaffProfile = Omit<StaffUser, "password">;

export function toStaffProfile(user: StaffUser): StaffProfile {
  const { password: _pw, ...profile } = user;
  return profile;
}

export function staffHomePath(user: StaffProfile, hasPending = false): string {
  if (user.login === "predsedatel" || user.role === "admin") return "/admin";
  if (user.role === "responsible") return "/admin/control";
  if (user.role === "leadership") return "/admin/reception";
  if (user.role === "reception" && hasPending) return "/admin/inbox";
  return "/admin";
}
