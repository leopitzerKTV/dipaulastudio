import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useErrorHandler } from '../useErrorHandler';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('deve retornar funções de error handling', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current).toHaveProperty('handleError');
    expect(result.current).toHaveProperty('handleAsyncError');
    expect(result.current).toHaveProperty('createSafeHandler');
  });

  describe('handleError', () => {
    it('deve logar erro e mostrar toast', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Teste de erro');

      result.current.handleError(error, {
        context: 'testContext',
        showToast: true,
      });

      expect(console.error).toHaveBeenCalledWith('[testContext]', error.message, error);
      expect(toast.error).toHaveBeenCalledWith(error.message);
    });

    it('deve re-throw quando solicitado', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Teste');

      expect(() => {
        result.current.handleError(error, {
          context: 'test',
          rethrow: true,
        });
      }).toThrow('Teste');
    });

    it('deve suportar string como erro', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError('Erro string', {
        context: 'test',
        showToast: true,
      });

      expect(toast.error).toHaveBeenCalledWith('Erro string');
    });

    it('deve usar level correto para logging', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(new Error('Aviso'), {
        context: 'test',
        level: 'warning',
        showToast: false,
      });

      expect(console.warn).toHaveBeenCalled();
    });

    it('deve não mostrar toast quando showToast é false', () => {
      const { result } = renderHook(() => useErrorHandler());

      result.current.handleError(new Error('Teste'), {
        context: 'test',
        showToast: false,
      });

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('handleAsyncError', () => {
    it('deve retornar resultado da função async', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const asyncFn = async () => 'resultado';
      const resultado = await result.current.handleAsyncError(asyncFn, {
        context: 'test',
      });

      expect(resultado).toBe('resultado');
    });

    it('deve capturar erro de função async e retornar null', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const asyncFn = async () => {
        throw new Error('Erro async');
      };

      const resultado = await result.current.handleAsyncError(asyncFn, {
        context: 'test',
        showToast: true,
      });

      expect(resultado).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Erro async');
    });
  });

  describe('createSafeHandler', () => {
    it('deve criar função segura que não lança erro', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const unsafeFn = async () => {
        throw new Error('Erro na função');
      };

      const safeFn = result.current.createSafeHandler(unsafeFn, {
        context: 'test',
        showToast: false,
      });

      const resultado = await safeFn();
      expect(resultado).toBeNull();
    });

    it('deve passar argumentos para a função original', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockFn = vi.fn(async (a: number, b: number) => a + b);
      const safeFn = result.current.createSafeHandler(mockFn, {
        context: 'test',
        showToast: false,
      });

      await safeFn(2, 3);
      expect(mockFn).toHaveBeenCalledWith(2, 3);
    });

    it('deve retornar resultado de função bem-sucedida', async () => {
      const { result } = renderHook(() => useErrorHandler());

      const fn = async () => 'sucesso';
      const safeFn = result.current.createSafeHandler(fn, {
        context: 'test',
      });

      const resultado = await safeFn();
      expect(resultado).toBe('sucesso');
    });
  });
});
