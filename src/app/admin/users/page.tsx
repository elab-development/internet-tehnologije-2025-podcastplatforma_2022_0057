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

const PAGE_SIZE = 5; // 👈 koliko korisnika po strani

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

  // 👇 edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [editAccountNumber, setEditAccountNumber] = useState("");

  // 👇 pagination state
  const [currentPage, setCurrentPage] = useState(1);

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

  // 🔍 filtriranje
  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.lastName.toLowerCase().includes(query.toLowerCase())
  );

  // 📄 pagination logika
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsers = filtered.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // reset na prvu stranu kad se menja pretraga
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

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
          {paginatedUsers.map((u) => {
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

      {/* 📄 PAGINACIJA */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Prethodna
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-stone-800 text-white"
                  : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Sledeća
          </button>
        </div>
      )}
    </section>
  );
}
