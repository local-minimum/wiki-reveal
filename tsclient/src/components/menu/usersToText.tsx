export function usersToText(users: string[]): string {
  if (users.length === 0) {
    return 'noone';
  }
  if (users.length === 1) {
    return users[0];
  }
  return `${users.slice(0, users.length - 1).join(', ')} & ${users[users.length - 1]}`;
}
