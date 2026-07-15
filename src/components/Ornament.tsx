export function Ornament({ style = {} }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", ...style }}>
      <span style={{
        height: "1px",
        width: "48px",
        background: "linear-gradient(to right, transparent, var(--gold))"
      }} />
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none" style={{ color: "var(--gold)" }}>
        <path
          d="M11 13C5.5 8 2 7 2 4.5C2 2.5 4 1 6 1.5C8 2 10 4 11 5.5C12 4 14 2 16 1.5C18 1 20 2.5 20 4.5C20 7 16.5 8 11 13Z"
          stroke="currentColor"
          strokeWidth="0.9"
          fill="currentColor"
          fillOpacity="0.18"
        />
      </svg>
      <span style={{
        height: "1px",
        width: "48px",
        background: "linear-gradient(to left, transparent, var(--gold))"
      }} />
    </div>
  );
}
