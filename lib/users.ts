export interface User {
  username: string
  password: string
  role: "admin" | "user"
}

export const users: User[] = [
  { username: "admin", password: "password123", role: "admin" },
  { username: "user1", password: "userpass1", role: "user" },
  { username: "user2", password: "userpass2", role: "user" },
  // Ajoutez autant d'utilisateurs que vous le souhaitez
]

