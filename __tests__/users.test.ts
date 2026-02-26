import { describe, it, expect, vi } from 'vitest';
import { DELETE } from '@/app/api/users/[id]/route'; // Proveri da li je putanja tačna zavisno od tvog foldera
import { NextRequest } from 'next/server';

// 1. Mock-ujemo bazu podataka
vi.mock('@/db', () => ({
  db: {
    delete: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue({ ok: true }),
  },
}));

// 2. Mock-ujemo sigurnosne provere
vi.mock('@/lib/security', () => ({ requireOrigin: vi.fn(() => null) }));
vi.mock('@/lib/csrf', () => ({ requireCsrf: vi.fn(() => null) }));
vi.mock('@/lib/requireAdmin', () => ({
  requireAdmin: vi.fn(),
}));

describe('Users DELETE API Route', () => {

  it('treba da vrati 400 ako admin pokuša da obriše samog sebe', async () => {
    const adminId = 'admin-123';
    
    // Simuliramo da je ulogovan admin sa ID-jem 'admin-123'
    const { requireAdmin } = await import('@/lib/requireAdmin');
    (requireAdmin as any).mockResolvedValue({
      ok: true,
      admin: { id: adminId }
    });

    // Pravimo zahtev za brisanje istog tog ID-ja
    const req = new NextRequest(`http://localhost:3000/api/users/${adminId}`, {
      method: 'DELETE',
    });

    // Next.js params se šalju u drugom argumentu
    const response = await DELETE(req, { params: Promise.resolve({ id: adminId }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Ne možete obrisati sopstveni nalog');
  });

  it('treba da vrati 200 (ok) ako admin briše drugog korisnika', async () => {
    const adminId = 'admin-123';
    const targetUserId = 'user-456';

    const { requireAdmin } = await import('@/lib/requireAdmin');
    (requireAdmin as any).mockResolvedValue({
      ok: true,
      admin: { id: adminId }
    });

    const req = new NextRequest(`http://localhost:3000/api/users/${targetUserId}`, {
      method: 'DELETE',
    });

    const response = await DELETE(req, { params: Promise.resolve({ id: targetUserId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });
});