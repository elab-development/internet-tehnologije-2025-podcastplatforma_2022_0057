"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "USER" | "PAID" | "ADMIN";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  accountNumber?: string | null;
};

const PAGE_SIZE = 5;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [editAccountNumber, setEditAccountNumber] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  
  const [csrf, setCsrf] = useState("");

  
  useEffect(() => {
    fetch("/api/csrf", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCsrf(d?.token ?? ""))
      .catch(() => setCsrf(""));
  }, []);

  
  const ensureCsrf = async () => {
    if (csrf) return csrf;
    const d = await fetch("/api/csrf", { credentials: "include" }).then((r) =>
      r.json()
    );
    const tok = d?.csrf ?? "";
    setCsrf(tok);
    return tok;
  };

  
  const apiJson = async (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    const method = (init?.method ?? "GET").toUpperCase();
    const isMutation = method !== "GET" && method !== "HEAD";

    
    if (init?.body && !(init.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    
    if (isMutation) {
      const tok = await ensureCsrf();
      if (!tok) throw new Error("CSRF token nije dostupan. Osveži stranicu.");
      headers.set("x-csrf-token", tok);
    }

    const res = await fetch(url, {
      credentials: "include",
      ...init,
      headers,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }

    if (!res.ok) {
      throw new Error(data?.error || `Greška (${res.status})`);
    }

    return data;
  };

  const load = async () => {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
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
    try {
      await apiJson(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          role: editRole,
          accountNumber: editRole === "PAID" ? editAccountNumber : null,
        }),
      });

      setEditingId(null);
      await load();
    } catch (e: any) {
      alert(e?.message || "Greška pri izmeni");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati korisnika?")) return;

    try {
      await apiJson(`/api/users/${id}`, {
        method: "DELETE",
      });

      await load();
    } catch (e: any) {
      alert(e?.message || "Greška pri brisanju");
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q)
    );
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsers = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Upravljanje korisnicima</h1>

      <input
        className="border px-4 py-2 rounded-xl w-full max-w-md"
        placeholder="Pretraga (email, ime ili prezime)"
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
                        onChange={(e) => setEditRole(e.target.value as Role)}
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
                          onChange={(e) => setEditAccountNumber(e.target.value)}
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

          {paginatedUsers.length === 0 && (
            <tr>
              <td className="p-6 text-center text-zinc-500" colSpan={4}>
                Nema korisnika za prikaz.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {filtered.length > 0 && totalPages > 1 && (
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
                currentPage === i + 1 ? "bg-stone-800 text-white" : ""
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