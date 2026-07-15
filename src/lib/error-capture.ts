// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

// List of errors to ignore in SPA mode (they don't break functionality)
const IGNORABLE_ERRORS = [
  'Invariant failed',
  'Cannot read property',
];

function isIgnorableError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return IGNORABLE_ERRORS.some(err => message.includes(err.toLowerCase()));
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => {
    const error = (event as ErrorEvent).error ?? event;
    if (!isIgnorableError(error)) {
      record(error);
    }
  });

  globalThis.addEventListener("unhandledrejection", (event) => {
    const reason = (event as PromiseRejectionEvent).reason;
    // Always prevent unhandled rejections from crashing in client mode
    event.preventDefault();

    if (!isIgnorableError(reason)) {
      record(reason);
    } else {
      // Log ignorable errors for debugging but don't break the app
      console.debug('[IgnorableError]', reason);
    }
  });
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
