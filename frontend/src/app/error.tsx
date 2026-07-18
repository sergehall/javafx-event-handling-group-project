"use client";

type GlobalErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <main className="fatal-error">
      <h1>The web lab could not be displayed.</h1>
      <p>{error.message || "An unexpected rendering error occurred."}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
