import { useCallback } from "react";
import { toast } from "sonner";

export type ErrorLevel = "error" | "warning" | "info";

interface ErrorContext {
  context: string;
  level?: ErrorLevel;
  showToast?: boolean;
  rethrow?: boolean;
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, ctx: ErrorContext) => {
    const { context, level = "error", showToast = true, rethrow = false } = ctx;

    // Extract error message
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Erro desconhecido";

    // Log to console with context
    const logFn = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
    logFn(`[${context}]`, message, error);

    // Show toast notification
    if (showToast) {
      const toastFn = level === "error" ? toast.error : level === "warning" ? toast.warning : toast.info;
      toastFn(message);
    }

    // Re-throw if requested
    if (rethrow) {
      throw error;
    }
  }, []);

  const handleAsyncError = useCallback(
    async <T,>(fn: () => Promise<T>, ctx: ErrorContext): Promise<T | null> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error, ctx);
        return null;
      }
    },
    [handleError],
  );

  const createSafeHandler = useCallback(
    <T extends any[], R,>(fn: (...args: T) => Promise<R>, ctx: ErrorContext) => {
      return async (...args: T): Promise<R | null> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error, ctx);
          return null;
        }
      };
    },
    [handleError],
  );

  return {
    handleError,
    handleAsyncError,
    createSafeHandler,
  };
}
