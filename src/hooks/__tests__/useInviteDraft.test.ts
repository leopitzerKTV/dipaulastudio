import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInviteDraft } from '../useInviteDraft';
import { loadJSON, persistDraftLocally } from '@/lib/inviteUtils';
import { DEFAULT_DRAFT, PALETTES } from '@/lib/inviteTypes';

vi.mock('@/lib/inviteUtils', () => ({
  loadJSON: vi.fn(),
  persistDraftLocally: vi.fn(),
}));

describe('useInviteDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (loadJSON as any).mockReturnValue(null);
  });

  it('deve retornar state com valores padrão', () => {
    const { result } = renderHook(() => useInviteDraft());

    expect(result.current.brideName).toBe(DEFAULT_DRAFT.brideName);
    expect(result.current.groomName).toBe(DEFAULT_DRAFT.groomName);
    expect(result.current.date).toBe(DEFAULT_DRAFT.date);
    expect(result.current.time).toBe(DEFAULT_DRAFT.time);
    expect(result.current.venue).toBe(DEFAULT_DRAFT.venue);
    expect(result.current.city).toBe(DEFAULT_DRAFT.city);
    expect(result.current.message).toBe(DEFAULT_DRAFT.message);
    expect(result.current.tagline).toBe(DEFAULT_DRAFT.tagline);
    expect(result.current.palette.id).toBe(DEFAULT_DRAFT.paletteId);
    expect(result.current.imageSrc).toBe(DEFAULT_DRAFT.imageSrc);
  });

  it('deve usar valores iniciais fornecidos', () => {
    const initial = {
      brideName: 'Maria',
      groomName: 'João',
      date: '15 · Julho · 2025',
      time: 'Domingo, às 18h00',
      venue: 'Igreja Matriz',
      city: 'Rio de Janeiro · RJ',
      message: 'Venham celebrar conosco',
      tagline: 'nos acompanhe',
      paletteId: 'romantic',
      imageSrc: 'data:image/png;base64,test',
    };

    const { result } = renderHook(() => useInviteDraft(initial));

    expect(result.current.brideName).toBe('Maria');
    expect(result.current.groomName).toBe('João');
    expect(result.current.date).toBe('15 · Julho · 2025');
  });

  it('deve carregar rascunho do localStorage se não houver initial', () => {
    const savedDraft = {
      brideName: 'Anna',
      groomName: 'Lucas',
      date: '10 · Agosto · 2025',
      time: 'Sábado, às 17h00',
      venue: 'Vila Histórica',
      city: 'Paraty · RJ',
      message: 'Convite da nuvem',
      tagline: 'salvo localmente',
      paletteId: 'champagne',
      imageSrc: 'data:image/png;base64,saved',
    };

    (loadJSON as any).mockReturnValue(savedDraft);

    const { result } = renderHook(() => useInviteDraft());

    expect(result.current.brideName).toBe('Anna');
    expect(result.current.groomName).toBe('Lucas');
    expect(result.current.date).toBe('10 · Agosto · 2025');
  });

  it('deve preferir initial em relação ao localStorage', () => {
    const savedDraft = {
      brideName: 'Anna',
      groomName: 'Lucas',
      date: '10 · Agosto · 2025',
      time: 'Sábado, às 17h00',
      venue: 'Vila Histórica',
      city: 'Paraty · RJ',
      message: 'Convite da nuvem',
      tagline: 'salvo localmente',
      paletteId: 'champagne',
      imageSrc: 'data:image/png;base64,saved',
    };

    (loadJSON as any).mockReturnValue(savedDraft);

    const initial = { brideName: 'Maria', groomName: 'João' };

    const { result } = renderHook(() => useInviteDraft(initial));

    expect(result.current.brideName).toBe('Maria');
    expect(result.current.groomName).toBe('João');
  });

  it('deve atualizar brideName', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setBrideName('Beatriz');
    });

    expect(result.current.brideName).toBe('Beatriz');
  });

  it('deve atualizar groomName', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setGroomName('Pedro');
    });

    expect(result.current.groomName).toBe('Pedro');
  });

  it('deve atualizar date', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setDate('31 · Dezembro · 2025');
    });

    expect(result.current.date).toBe('31 · Dezembro · 2025');
  });

  it('deve atualizar time', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setTime('Terça-feira, às 20h00');
    });

    expect(result.current.time).toBe('Terça-feira, às 20h00');
  });

  it('deve atualizar venue', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setVenue('Salão de Festas Novo');
    });

    expect(result.current.venue).toBe('Salão de Festas Novo');
  });

  it('deve atualizar city', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setCity('Belo Horizonte · MG');
    });

    expect(result.current.city).toBe('Belo Horizonte · MG');
  });

  it('deve atualizar message', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setMessage('Uma nova mensagem');
    });

    expect(result.current.message).toBe('Uma nova mensagem');
  });

  it('deve atualizar tagline', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setTagline('Você é especial');
    });

    expect(result.current.tagline).toBe('Você é especial');
  });

  it('deve atualizar palette', () => {
    const { result } = renderHook(() => useInviteDraft());

    const romanticPalette = PALETTES.find(p => p.id === 'romantic');

    if (romanticPalette) {
      act(() => {
        result.current.setPalette(romanticPalette);
      });

      expect(result.current.palette.id).toBe('romantic');
    }
  });

  it('deve atualizar imageSrc', () => {
    const { result } = renderHook(() => useInviteDraft());

    const newImageSrc = 'data:image/png;base64,newimage';

    act(() => {
      result.current.setImageSrc(newImageSrc);
    });

    expect(result.current.imageSrc).toBe(newImageSrc);
  });

  it('deve incluir draft no retorno com todos os campos atualizados', () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setBrideName('Laura');
      result.current.setGroomName('Carlos');
      result.current.setDate('01 · Janeiro · 2026');
    });

    expect(result.current.draft.brideName).toBe('Laura');
    expect(result.current.draft.groomName).toBe('Carlos');
    expect(result.current.draft.date).toBe('01 · Janeiro · 2026');
    expect(result.current.draft.paletteId).toBe(DEFAULT_DRAFT.paletteId);
  });

  it('deve fazer autosave com debounce de 400ms', async () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setBrideName('Sophia');
    });

    // Não deve ter chamado persistDraftLocally imediatamente
    expect(persistDraftLocally).not.toHaveBeenCalled();

    // Avançar 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Agora deve ter chamado
    expect(persistDraftLocally).toHaveBeenCalledWith(
      expect.objectContaining({
        brideName: 'Sophia',
      })
    );
  });

  it('deve cancelar timeout anterior quando state muda antes de 400ms', async () => {
    const { result } = renderHook(() => useInviteDraft());

    act(() => {
      result.current.setBrideName('Ana');
    });

    // Avançar 200ms (metade do debounce)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Mudar novamente (deve resetar timeout)
    act(() => {
      result.current.setBrideName('Bruno');
    });

    // Avançar 200ms mais (total 400ms do primeiro, 200ms do segundo)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Verificar que ainda não foi chamado (só 200ms do segundo timeout)
    expect(persistDraftLocally).not.toHaveBeenCalled();

    // Avançar 200ms mais para completar os 400ms do segundo timeout
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Agora deve ter sido chamado apenas uma vez (com o segundo valor)
    expect(persistDraftLocally).toHaveBeenCalledTimes(1);
  });

  it('deve fazer autosave quando qualquer campo mudar', async () => {
    const { result } = renderHook(() => useInviteDraft());

    // Testar mudança de brideName
    act(() => {
      result.current.setBrideName('Test1');
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(persistDraftLocally).toHaveBeenCalled();

    vi.clearAllMocks();

    // Testar mudança de venue
    act(() => {
      result.current.setVenue('Test Venue');
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(persistDraftLocally).toHaveBeenCalled();
  });

  it('deve retornar funções de setter', () => {
    const { result } = renderHook(() => useInviteDraft());

    expect(typeof result.current.setBrideName).toBe('function');
    expect(typeof result.current.setGroomName).toBe('function');
    expect(typeof result.current.setDate).toBe('function');
    expect(typeof result.current.setTime).toBe('function');
    expect(typeof result.current.setVenue).toBe('function');
    expect(typeof result.current.setCity).toBe('function');
    expect(typeof result.current.setMessage).toBe('function');
    expect(typeof result.current.setTagline).toBe('function');
    expect(typeof result.current.setPalette).toBe('function');
    expect(typeof result.current.setImageSrc).toBe('function');
  });

  it('deve retornar função onPickImage', () => {
    const { result } = renderHook(() => useInviteDraft());

    expect(typeof result.current.onPickImage).toBe('function');
  });

  it('deve selecionar palette correta pelo ID', () => {
    const initial = {
      paletteId: 'mahogany',
    };

    const { result } = renderHook(() => useInviteDraft(initial));

    expect(result.current.palette.id).toBe('mahogany');
  });

  it('deve usar palette padrão se paletteId não existir', () => {
    const initial = {
      paletteId: 'nonexistent',
    };

    const { result } = renderHook(() => useInviteDraft(initial));

    // Deve usar a primeira palette (index 0)
    expect(result.current.palette.id).toBe(PALETTES[0].id);
  });
});
