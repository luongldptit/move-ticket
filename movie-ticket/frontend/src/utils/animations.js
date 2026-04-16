// Shared keyframes for all pages
export const KEYFRAMES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideLeft {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes seatPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.35); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  @keyframes checkmark {
    from { stroke-dashoffset: 100; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes shimmerSlide {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 15px rgba(225,29,72,0.3); }
    50%       { box-shadow: 0 0 35px rgba(225,29,72,0.6), 0 0 60px rgba(225,29,72,0.2); }
  }
  @keyframes floatUpDown {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes rollIn {
    from { opacity: 0; transform: translateY(20px) rotateX(-20deg); }
    to   { opacity: 1; transform: translateY(0) rotateX(0); }
  }
`

// Stagger entrance style helper
export function staggerStyle(index, baseDelay = 0, duration = 0.45) {
  return {
    animation: `fadeSlideUp ${duration}s ease-out both`,
    animationDelay: `${baseDelay + index * 70}ms`,
  }
}

// Scale-in style helper
export function scaleInStyle(delay = 0) {
  return {
    animation: `scaleIn 0.4s ease-out both`,
    animationDelay: `${delay}ms`,
  }
}
