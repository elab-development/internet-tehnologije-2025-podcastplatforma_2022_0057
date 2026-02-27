import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

// 1. Mock-ujemo bazu i auth funkcije
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
  },
}));

vi.mock('@/lib/auth', () => ({
  signAuthToken: vi.fn().mockResolvedValue('lazni-token'),
  AUTH_COOKIE: 'auth',
  cookieOpts: vi.fn(),
}));

describe('Register API Route', () => {
  
  it('treba da vrati 400 ako nedostaju obavezna polja', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@gmail.com' }), // Nedostaju lozinka i imena
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Morate uneti sve podatke');
  });

  it('treba da vrati 400 ako je lozinka kraća od 8 karaktera', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Lozinka mora imati najmanje 8 karaktera');
  });

  it('treba da vrati 400 ako domen emaila nije dozvoljen', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@nepoznato.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Dozvoljeni domeni');
  });

  it('treba da vrati 400 ako je datum rođenja u budućnosti', async () => {
    const sutra = new Date();
    sutra.setDate(sutra.getDate() + 1);

    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        birthDate: sutra.toISOString()
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Datum rođenja ne može biti u budućnosti');
  });
});