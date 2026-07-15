// Minimal error capture - test setup
// TODO: Re-enable error handling after identifying the root cause

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

// Commented out: All error handlers
// Reason: Trying to identify what's causing "Invariant failed" error

// if (typeof globalThis.addEventListener === "function") {
//   globalThis.addEventListener("error", (event) => {
//     console.log("Error event:", event);
//   });
//
//   globalThis.addEventListener("unhandledrejection", (event) => {
//     console.log("Unhandled rejection:", event.reason);
//     event.preventDefault();
//   });
// }

export function consumeLastCapturedError(): unknown {
  return lastCapturedError?.error;
}
