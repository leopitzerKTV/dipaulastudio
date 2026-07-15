export function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-[var(--gold)]/25 bg-[var(--ivory)] px-3 py-2 text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]";
  return (
    <label className="block">
      <span className="mb-1 block font-serif-caps text-[9px] text-[var(--gold-deep)]/80">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}
