import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInviteExport } from '../useInviteExport';
import { toPng, toJpeg } from 'html-to-image';
import { DEFAULT_DRAFT, PALETTES } from '@/lib/inviteTypes';

vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
  toJpeg: vi.fn(),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

describe('useInviteExport', () => {
  const palette = PALETTES[0];
  const draft = DEFAULT_DRAFT;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar previewRef', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(result.current.previewRef).toBeDefined();
    expect(typeof result.current.previewRef).toBe('object');
  });

  it('deve inicializar exporting como false', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(result.current.exporting).toBe(false);
  });

  it('deve inicializar exportingPdf como false', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(result.current.exportingPdf).toBe(false);
  });

  it('deve inicializar exportingJpg como false', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(result.current.exportingJpg).toBe(false);
  });

  it('deve inicializar anyExporting como false', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(result.current.anyExporting).toBe(false);
  });

  it('deve retornar função onExport', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(typeof result.current.onExport).toBe('function');
  });

  it('deve retornar função onExportPdf', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(typeof result.current.onExportPdf).toBe('function');
  });

  it('deve retornar função onExportJpg', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(typeof result.current.onExportJpg).toBe('function');
  });

  it('deve retornar função renderHighResPng', () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    expect(typeof result.current.renderHighResPng).toBe('function');
  });

  it('deve retornar null em renderHighResPng se previewRef não existir', async () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    const dataUrl = await result.current.renderHighResPng();

    expect(dataUrl).toBeNull();
  });

  it('deve chamar toPng com configurações corretas em renderHighResPng', async () => {
    const mockDataUrl = 'data:image/png;base64,test';
    (toPng as any).mockResolvedValue(mockDataUrl);

    const { result } = renderHook(() => useInviteExport(palette, draft));

    // Simular elemento DOM
    result.current.previewRef.current = document.createElement('div');

    const dataUrl = await result.current.renderHighResPng();

    expect(toPng).toHaveBeenCalledWith(
      result.current.previewRef.current,
      expect.objectContaining({
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: palette.bg,
      })
    );
    expect(dataUrl).toBe(mockDataUrl);
  });

  it('deve exportar como PNG quando onExport é chamado', async () => {
    const mockDataUrl = 'data:image/png;base64,test';
    (toPng as any).mockResolvedValue(mockDataUrl);

    const { result } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    await act(async () => {
      await result.current.onExport();
    });

    expect(result.current.exporting).toBe(false);
    expect(toPng).toHaveBeenCalled();
  });

  it('deve definir nome de arquivo correto ao exportar PNG', async () => {
    const mockDataUrl = 'data:image/png;base64,test';
    (toPng as any).mockResolvedValue(mockDataUrl);

    let createdAnchor: any = null;
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tag) => {
      if (tag === 'a') {
        createdAnchor = originalCreateElement.call(document, 'a');
        return createdAnchor;
      }
      return originalCreateElement.call(document, tag);
    });

    const testDraft = {
      ...DEFAULT_DRAFT,
      brideName: 'Maria',
      groomName: 'João',
    };

    const { result } = renderHook(() => useInviteExport(palette, testDraft));
    result.current.previewRef.current = document.createElement('div');

    await act(async () => {
      await result.current.onExport();
    });

    expect(createdAnchor?.download).toContain('convite');
    expect(createdAnchor?.download).toContain('maria');
    expect(createdAnchor?.download).toContain('joão');
    expect(createdAnchor?.download).toContain('.png');
  });

  it('deve exportar como JPG quando onExportJpg é chamado', async () => {
    const mockDataUrl = 'data:image/jpeg;base64,test';
    (toJpeg as any).mockResolvedValue(mockDataUrl);

    const { result } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    await act(async () => {
      await result.current.onExportJpg();
    });

    expect(result.current.exportingJpg).toBe(false);
    expect(toJpeg).toHaveBeenCalledWith(
      result.current.previewRef.current,
      expect.objectContaining({
        pixelRatio: 4,
        cacheBust: true,
        quality: 0.95,
        backgroundColor: palette.bg,
      })
    );
  });

  it('deve definir nome de arquivo correto ao exportar JPG', async () => {
    const mockDataUrl = 'data:image/jpeg;base64,test';
    (toJpeg as any).mockResolvedValue(mockDataUrl);

    let createdAnchor: any = null;
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tag) => {
      if (tag === 'a') {
        createdAnchor = originalCreateElement.call(document, 'a');
        return createdAnchor;
      }
      return originalCreateElement.call(document, tag);
    });

    const testDraft = {
      ...DEFAULT_DRAFT,
      brideName: 'Ana',
      groomName: 'Carlos',
    };

    const { result } = renderHook(() => useInviteExport(palette, testDraft));
    result.current.previewRef.current = document.createElement('div');

    await act(async () => {
      await result.current.onExportJpg();
    });

    expect(createdAnchor?.download).toContain('convite');
    expect(createdAnchor?.download).toContain('ana');
    expect(createdAnchor?.download).toContain('carlos');
    expect(createdAnchor?.download).toMatch(/\.jpg$/);

  });

  it('deve definir exporting como true durante exportação PNG', async () => {
    const mockDataUrl = 'data:image/png;base64,test';
    const resolvePromise = { current: null as any };

    (toPng as any).mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise.current = resolve;
      });
    });

    const { result, rerender } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    act(() => {
      result.current.onExport();
    });

    rerender();
    expect(result.current.exporting).toBe(true);

    act(() => {
      resolvePromise.current(mockDataUrl);
    });

    // Aguardar promise resolver
    await new Promise((resolve) => setTimeout(resolve, 0));

    rerender();
    expect(result.current.exporting).toBe(false);
  });

  it('deve definir exportingJpg como true durante exportação JPG', async () => {
    const mockDataUrl = 'data:image/jpeg;base64,test';
    const resolvePromise = { current: null as any };

    (toJpeg as any).mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise.current = resolve;
      });
    });

    const { result, rerender } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    act(() => {
      result.current.onExportJpg();
    });

    rerender();
    expect(result.current.exportingJpg).toBe(true);

    act(() => {
      resolvePromise.current(mockDataUrl);
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    rerender();
    expect(result.current.exportingJpg).toBe(false);
  });

  it('deve atualizar anyExporting quando exporting muda', async () => {
    const mockDataUrl = 'data:image/png;base64,test';
    const resolvePromise = { current: null as any };

    (toPng as any).mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise.current = resolve;
      });
    });

    const { result, rerender } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    expect(result.current.anyExporting).toBe(false);

    act(() => {
      result.current.onExport();
    });

    rerender();
    expect(result.current.anyExporting).toBe(true);

    act(() => {
      resolvePromise.current(mockDataUrl);
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    rerender();
    expect(result.current.anyExporting).toBe(false);
  });

  it('deve não fazer nada se previewRef for null em onExport', async () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    await act(async () => {
      await result.current.onExport();
    });

    expect(toPng).not.toHaveBeenCalled();
  });

  it('deve não fazer nada se previewRef for null em onExportJpg', async () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    await act(async () => {
      await result.current.onExportJpg();
    });

    expect(toJpeg).not.toHaveBeenCalled();
  });

  it('deve não fazer nada se previewRef for null em onExportPdf', async () => {
    const { result } = renderHook(() => useInviteExport(palette, draft));

    await act(async () => {
      await result.current.onExportPdf();
    });

    expect(toPng).not.toHaveBeenCalled();
  });

  it('deve resetar exporting mesmo se houver erro', async () => {
    (toPng as any).mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    try {
      await act(async () => {
        await result.current.onExport();
      });
    } catch {
      // Esperado
    }

    expect(result.current.exporting).toBe(false);
  });

  it('deve resetar exportingJpg mesmo se houver erro', async () => {
    (toJpeg as any).mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    try {
      await act(async () => {
        await result.current.onExportJpg();
      });
    } catch {
      // Esperado
    }

    expect(result.current.exportingJpg).toBe(false);
  });

  it('deve resetar exportingPdf mesmo se houver erro', async () => {
    (toPng as any).mockRejectedValue(new Error('Export failed'));

    const { result } = renderHook(() => useInviteExport(palette, draft));
    result.current.previewRef.current = document.createElement('div');

    try {
      await act(async () => {
        await result.current.onExportPdf();
      });
    } catch {
      // Esperado
    }

    expect(result.current.exportingPdf).toBe(false);
  });
});
