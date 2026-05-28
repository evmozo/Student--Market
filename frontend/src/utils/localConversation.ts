export const buildConversationId = (firstUserId: string, secondUserId: string): string =>
  [firstUserId, secondUserId].sort().join("-");
