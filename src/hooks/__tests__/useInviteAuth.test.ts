import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInviteAuth } from '../useInviteAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  migrateLocalDraftsToSupabase,
  mapRowToDraft,
  persistVersionsLocally,
  rowToSavedVersion,
} from '@/lib/inviteUtils';
import { AUTOSAVE_LABEL, MAX_VERSIONS } from '@/lib/inviteTypes';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/lib/inviteUtils', () => ({
  migrateLocalDraftsToSupabase: vi.fn(),
  mapRowToDraft: vi.fn(),
  persistVersionsLocally: vi.fn(),
  rowToSavedVersion: vi.fn(),
}));

describe('useInviteAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock padrão para getSession
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
    });

    // Mock padrão para onAuthStateChange
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    // Mock padrão para supabase.from()
    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
      delete: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    });
  });

  it('deve inicializar com userId null', () => {
    const { result } = renderHook(() => useInviteAuth());

    expect(result.current.userId).toBeNull();
  });

  it('deve inicializar autosaveReady como false', () => {
    const { result } = renderHook(() => useInviteAuth());

    expect(result.current.autosaveReady).toBe(false);
  });

  it('deve inicializar draftRowId como null', () => {
    const { result } = renderHook(() => useInviteAuth());

    expect(result.current.draftRowId).toBeNull();
  });

  it('deve obter sessão atual ao montar', async () => {
    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  it('deve configurar userId a partir da sessão obtida', async () => {
    const userId = 'test-user-id';
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });
  });

  it('deve escutar mudanças de autenticação', async () => {
    const unsubscribeMock = vi.fn();
    (supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });

    const { unmount } = renderHook(() => useInviteAuth());

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('deve atualizar userId quando autenticação mudar', async () => {
    let authCallback: any;

    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    const { result } = renderHook(() => useInviteAuth());

    const userId = 'new-user-id';

    act(() => {
      authCallback('SIGNED_IN', { user: { id: userId } });
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });
  });

  it('deve limpar userId quando usuário fizer logout', async () => {
    let authCallback: any;

    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    const { result } = renderHook(() => useInviteAuth());

    act(() => {
      authCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(result.current.userId).toBeNull();
    });
  });

  it('deve fazer fetchSavedInvites retornar undefined se não houver userId', async () => {
    const { result } = renderHook(() => useInviteAuth());

    const response = await result.current.fetchSavedInvites();

    expect(response).toBeUndefined();
  });

  it('deve buscar invites salvos do Supabase quando userId existe', async () => {
    const userId = 'test-user-id';
    const mockRows = [
      {
        id: 'invite-1',
        user_id: userId,
        label: AUTOSAVE_LABEL,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'invite-2',
        user_id: userId,
        label: 'My Version',
        updated_at: new Date().toISOString(),
      },
    ];

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
    });

    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });

    const fetchResult = await result.current.fetchSavedInvites();

    expect(supabase.from).toHaveBeenCalledWith('saved_invites');
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(eqMock).toHaveBeenCalledWith('user_id', userId);
    expect(isMock).toHaveBeenCalledWith('deleted_at', null);
  });

  it('deve mostrar erro de toast se fetch falhar', async () => {
    const userId = 'test-user-id';

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Fetch error'),
    });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
    });

    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });

    await result.current.fetchSavedInvites();

    expect(toast.error).toHaveBeenCalledWith('Não foi possível sincronizar seus convites');
  });

  it('deve definir draftRowId ao encontrar autosave', async () => {
    const userId = 'test-user-id';
    const draftId = 'draft-row-id';
    const mockRows = [
      {
        id: draftId,
        user_id: userId,
        label: AUTOSAVE_LABEL,
        updated_at: new Date().toISOString(),
      },
    ];

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
    });

    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });

    await result.current.fetchSavedInvites();

    expect(result.current.draftRowId).toBe(draftId);
  });

  it('deve retornar remoteDraft ao hydrateDraft se autosave existe', async () => {
    const userId = 'test-user-id';
    const mockDraft = {
      brideName: 'Test',
      groomName: 'User',
      date: '01 · Janeiro · 2026',
      time: '16h00',
      venue: 'Church',
      city: 'City',
      message: 'Message',
      tagline: 'Tagline',
      paletteId: 'champagne',
      imageSrc: 'data:image/png',
    };

    const mockRows = [
      {
        id: 'draft-id',
        user_id: userId,
        label: AUTOSAVE_LABEL,
        updated_at: new Date().toISOString(),
        published_url: null,
      },
    ];

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
      delete: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    });

    (mapRowToDraft as any).mockReturnValue(mockDraft);

    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });

    // Chamar fetchSavedInvites diretamente já que a inicialização pode não chamar
    const fetchResult = await result.current.fetchSavedInvites({ hydrateDraft: true });

    expect(mapRowToDraft).toHaveBeenCalled();
    // O resultado deve conter remoteDraft ou versions
    expect(fetchResult).toBeDefined();
  });

  it('deve persistir versões remotas localmente', async () => {
    const userId = 'test-user-id';
    const mockRows = [
      {
        id: 'version-1',
        user_id: userId,
        label: 'Version 1',
        updated_at: new Date().toISOString(),
        published_url: null,
      },
      {
        id: 'version-2',
        user_id: userId,
        label: 'Version 2',
        updated_at: new Date().toISOString(),
        published_url: 'https://example.com',
      },
    ];

    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
    });

    (rowToSavedVersion as any).mockImplementation((row) => ({
      id: row.id,
      label: row.label,
      savedAt: Date.now(),
    }));

    const { result } = renderHook(() => useInviteAuth());

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });

    await result.current.fetchSavedInvites();

    expect(persistVersionsLocally).toHaveBeenCalled();
  });

  it('deve chamar setDraftRowId', () => {
    const { result } = renderHook(() => useInviteAuth());

    act(() => {
      result.current.setDraftRowId('new-draft-id');
    });

    expect(result.current.draftRowId).toBe('new-draft-id');
  });

  it('deve ter função fetchSavedInvites como função', () => {
    const { result } = renderHook(() => useInviteAuth());

    expect(typeof result.current.fetchSavedInvites).toBe('function');
  });

  it('deve retornar hydratedFromCloud como ref', () => {
    const { result } = renderHook(() => useInviteAuth());

    expect(result.current.hydratedFromCloud).toBeDefined();
    expect(typeof result.current.hydratedFromCloud).toBe('object');
  });

  it('deve chamar migrateLocalDraftsToSupabase quando userId mudar', async () => {
    let authCallback: any;

    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
    });

    (migrateLocalDraftsToSupabase as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useInviteAuth());

    const userId = 'test-user-id';

    act(() => {
      authCallback('SIGNED_IN', { user: { id: userId } });
    });

    await waitFor(() => {
      expect(result.current.userId).toBe(userId);
    });

    await waitFor(() => {
      expect(migrateLocalDraftsToSupabase).toHaveBeenCalledWith(userId);
    });
  });

  it('deve definir autosaveReady como true após migração', async () => {
    let authCallback: any;

    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockReturnThis();
    const isMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      eq: eqMock,
      is: isMock,
      order: orderMock,
    });

    (migrateLocalDraftsToSupabase as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useInviteAuth());

    const userId = 'test-user-id';

    act(() => {
      authCallback('SIGNED_IN', { user: { id: userId } });
    });

    await waitFor(() => {
      expect(result.current.autosaveReady).toBe(true);
    });
  });
});
