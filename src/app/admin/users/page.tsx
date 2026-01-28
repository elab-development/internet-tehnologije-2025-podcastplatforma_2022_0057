"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  const load = async () => {
    const res = await fetch("/api/users", { credentials: "include" });
    setUsers(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: string, role: string) => {
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati korisnika?")) return;
    await fetch(`/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    load();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Admin – Korisnici</h1>

      {users.map((u) => (
        <div key={u.id} className="flex justify-between bg-white p-4 rounded mb-2">
          <div>
            {u.email} ({u.role})
          </div>

          <div className="flex gap-4">
            <select
              value={u.role}
              onChange={(e) => updateRole(u.id, e.target.value)}
              className="border px-2"
            >
              <option value="USER">USER</option>
              <option value="PAID">PAID</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button onClick={() => remove(u.id)} className="text-red-600">
              Obriši
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
