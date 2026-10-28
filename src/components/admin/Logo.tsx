import React from 'react'

export function Seal({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <text x="32" y="41" textAnchor="middle" fontFamily="Georgia, serif" fontSize="26" fill="currentColor">
        T
      </text>
    </svg>
  )
}

export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--theme-text)' }}>
      <Seal size={48} />
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, letterSpacing: '0.12em' }}>TAMOS</div>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>Президентская администрация</div>
      </div>
    </div>
  )
}

export function Icon() {
  return (
    <span style={{ color: 'var(--theme-text)', display: 'inline-flex' }}>
      <Seal size={26} />
    </span>
  )
}
