"use client";

import { useEffect, useState } from "react";

type Role = "USER" | "PAID" | "ADMIN";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  accountNumber?: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

  // 👇 stanje za edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [editAccountNumber, setEditAccountNumber] = useState("");

  const load = async () => {
    const res = await fetch("/api/users", { credentials: "include" });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditAccountNumber(u.accountNumber || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAccountNumber("");
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: editRole,
        accountNumber: editRole === "PAID" ? editAccountNumber : null,
      }),
    });

    setEditingId(null);
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

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.lastName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Upravljanje korisnicima</h1>

      <input
        className="border px-4 py-2 rounded-xl w-full max-w-md"
        placeholder="Pretraga (email ili prezime)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Ime</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4">Uloga</th>
            <th className="p-4">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const isEditing = editingId === u.id;

            return (
              <tr key={u.id} className="border-b align-top">
                <td className="p-4">
                  {u.firstName} {u.lastName}
                </td>

                <td className="p-4">{u.email}</td>

                <td className="p-4 space-y-2">
                  {isEditing ? (
                    <>
                      <select
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(e.target.value as Role)
                        }
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="USER">USER</option>
                        <option value="PAID">PAID</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      {/* 👇 POLJE SAMO TOKOM IZMENE */}
                      {editRole === "PAID" && (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Broj računa"
                          value={editAccountNumber}
                          onChange={(e) =>
                            setEditAccountNumber(e.target.value)
                          }
                        />
                      )}
                    </>
                  ) : (
                    <span className="font-medium">{u.role}</span>
                  )}
                </td>

                <td className="p-4 space-x-2 text-center">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(u.id)}
                        className="text-green-600 hover:underline"
                      >
                        Sačuvaj
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:underline"
                      >
                        Otkaži
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        className="text-blue-600 hover:underline"
                      >
                        Izmeni
                      </button>
                      <button
                        onClick={() => remove(u.id)}
                        className="text-red-600 hover:underline"
                      >
                        Obriši
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
