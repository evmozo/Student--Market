import type { User } from "../types";

export const userId = (user: User): string => user.id ?? user._id ?? "";
