import { describe, it, expect, vi } from 'vitest';

// 1. Mock-ujemo AssemblyAI pre importa
vi.mock('assemblyai', () => {
  return {
    
    AssemblyAI: vi.fn().mockImplementation(function() {
      return {
        transcripts: {
          transcribe: vi.fn().mockResolvedValue({
            text: 'Ovo je testni transkript',
            summary: 'Ovo je testni rezime',
          }),
        },
      };
    }),
  };
});

// 2. Importujemo funkciju koju testiramo
import { processPodcastAudio } from '@/lib/assemblyai';

describe('AssemblyAI Logic', () => {
  it('treba da vrati tekst i rezime kada je obrada uspješna', async () => {
    const result = await processPodcastAudio('lazna/putanja.mp3');
    
    expect(result).not.toBeNull();
    expect(result?.text).toBe('Ovo je testni transkript');
    expect(result?.summary).toBe('Ovo je testni rezime');
  });
});