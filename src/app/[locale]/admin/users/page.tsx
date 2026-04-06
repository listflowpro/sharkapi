import { adminGetUsers } from "@/lib/admin-data";
import { UsersClient } from "./UsersClient";

export default async function AdminUsersPage() {
  const users = await adminGetUsers();
  return <UsersClient initialUsers={users} />;
}
