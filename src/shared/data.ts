import type { Role } from './types'

export type User = { name: string; email: string; role: Role }

export const USERS: User[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Admin' },
  { name: 'Alan Turing', email: 'alan@example.com', role: 'User' },
  { name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin' },
  { name: 'Katherine Johnson', email: 'katherine@example.com', role: 'User' },
  { name: 'Linus Torvalds', email: 'linus@example.com', role: 'User' },
  { name: 'Margaret Hamilton', email: 'margaret@example.com', role: 'Admin' },
]
