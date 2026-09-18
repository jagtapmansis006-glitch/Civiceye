export const queryKeys = {
  me: (userId: string | undefined) => ["me", userId] as const,
  myReports: (userId: string | undefined) => ["reports", "mine", userId] as const,
  assignedReports: (userId: string | undefined) => ["reports", "assigned", userId] as const,
  allReports: () => ["reports", "all"] as const,
  report: (id: string) => ["reports", "detail", id] as const,
  reportHistory: (id: string) => ["reports", "history", id] as const,
  reportMedia: (id: string) => ["reports", "media", id] as const,
  staffDirectory: () => ["staff"] as const,
  users: () => ["users"] as const,
};
