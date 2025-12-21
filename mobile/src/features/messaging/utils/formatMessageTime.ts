// src/features/messaging/utils/formatMessageTime.ts
// Message time formatting utility

/**
 * Format message timestamp to relative or absolute time
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Şimdi';
  }

  if (diffMins < 60) {
    return `${diffMins}d`;
  }

  if (diffHours < 24) {
    return `${diffHours}s`;
  }

  if (diffDays < 7) {
    return `${diffDays}g`;
  }

  // Format as date
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
};
