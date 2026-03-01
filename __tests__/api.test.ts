import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/episodes/route';
import { NextRequest } from 'next/server';


vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn().mockReturnValue(undefined), 
  })),
}));


vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

describe('Episodes API Route', () => {
  it('treba da vrati 401 Unauthorized ako korisnik nije ulogovan', async () => {
    const req = new NextRequest('http://localhost:3000/api/episodes', {
      method: 'POST',
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});