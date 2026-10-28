/** Печать-монограмма TAMOS. Используется, пока в настройках не загружен собственный логотип. */
export function Seal({ size = 44, className }: { size?: number; className?: string }) {
  const text = 'ПРЕЗИДЕНТСКАЯ АДМИНИСТРАЦИЯ · TAMOS · '
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <path id="seal-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <text fill="currentColor" style={{ fontFamily: 'var(--font-wide)', fontSize: 6.6 }}>
        <textPath href="#seal-ring" startOffset="0" textLength="236" lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
      <text x="50" y="62" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'var(--font-serif)', fontSize: 38 }}>
        T
      </text>
    </svg>
  )
}
