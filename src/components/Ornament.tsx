export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--gold)]" />
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none" className="text-[var(--gold)]">
        <path d="M11 13C5.5 8 2 7 2 4.5C2 2.5 4 1 6 1.5C8 2 10 4 11 5.5C12 4 14 2 16 1.5C18 1 20 2.5 20 4.5C20 7 16.5 8 11 13Z" stroke="currentColor" strokeWidth="0.9" fill="currentColor" fillOpacity="0.18"/>
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--gold)]" />
    </div>
  );
}
