import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  safeClear,
  tryFreeUpSpace,
} from '../safeStorage';

describe('safeStorage', () => {
  beforeEach(() => {
    // Clear todos os mocks
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('safeSetItem', () => {
    it('deve salvar item no localStorage', () => {
      const result = safeSetItem('testKey', 'testValue');

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    });

    it('deve retornar false se quota excedida', () => {
      // Mock localStorage.setItem para lançar QuotaExceededError
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = safeSetItem('key', 'value');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('deve logar erro se falhar', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Erro genérico');
      });

      const result = safeSetItem('key', 'value');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('safeGetItem', () => {
    it('deve recuperar item do localStorage', () => {
      (localStorage.getItem as any).mockReturnValue('testValue');

      const result = safeGetItem('testKey');

      expect(result).toBe('testValue');
    });

    it('deve retornar null se item não existe', () => {
      (localStorage.getItem as any).mockReturnValue(null);

      const result = safeGetItem('inexistente');

      expect(result).toBeNull();
    });

    it('deve logar erro se falhar', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Erro ao ler');
      });

      const result = safeGetItem('key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('safeRemoveItem', () => {
    it('deve remover item do localStorage', () => {
      (localStorage.removeItem as any).mockReturnValue(undefined);

      const result = safeRemoveItem('testKey');

      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
    });

    it('deve logar erro se falhar', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Erro ao remover');
      });

      const result = safeRemoveItem('key');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('safeClear', () => {
    it('deve limpar localStorage', () => {
      (localStorage.clear as any).mockReturnValue(undefined);

      const result = safeClear();

      expect(result).toBe(true);
      expect(localStorage.clear).toHaveBeenCalled();
    });

    it('deve logar erro se falhar', () => {
      try {
        (localStorage.clear as any).mockImplementation(() => {
          throw new Error('Erro ao limpar');
        });

        const result = safeClear();

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      } finally {
        // Restaurar mock padrão
        (localStorage.clear as any).mockReturnValue(undefined);
      }
    });
  });

  describe('tryFreeUpSpace', () => {
    it('deve retornar true se já há espaço suficiente', () => {
      // Tamanho pequeno dentro do limite de 5MB
      const result = tryFreeUpSpace(1000);

      expect(result).toBe(true);
    });

    it('deve retornar false se não conseguir liberar espaço suficiente', () => {
      // Tamanho muito grande (10MB) nunca caberá em 5MB
      const result = tryFreeUpSpace(10 * 1024 * 1024);

      expect(result).toBe(false);
    });

    it('deve respeitar skipKeys ao tentar liberar espaço', () => {
      // Este teste verifica que a função aceita skipKeys como parâmetro
      const result = tryFreeUpSpace(1000, ['protected']);

      expect(result).toBe(true);
    });
  });
});
