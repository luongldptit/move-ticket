export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full border-2 border-dark-700 border-t-primary-500`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-6">
        {/* Film reel with glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-glow-pulse" />
          <div className="relative w-16 h-16 animate-spin-slow">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
              <circle cx="12" cy="12" r="3"  fill="currentColor" />
              <circle cx="12" cy="5"  r="1.5" fill="currentColor" fillOpacity="0.7" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" fillOpacity="0.7" />
              <circle cx="5"  cy="12" r="1.5" fill="currentColor" fillOpacity="0.7" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" fillOpacity="0.7" />
              <circle cx="7.2"  cy="7.2"  r="1.5" fill="currentColor" fillOpacity="0.5" />
              <circle cx="16.8" cy="7.2"  r="1.5" fill="currentColor" fillOpacity="0.5" />
              <circle cx="7.2"  cy="16.8" r="1.5" fill="currentColor" fillOpacity="0.5" />
              <circle cx="16.8" cy="16.8" r="1.5" fill="currentColor" fillOpacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1">
          <span className="text-dark-400 text-sm mr-1">Đang tải</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
