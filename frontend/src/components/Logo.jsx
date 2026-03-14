/**
 * Logo component — Deepthi Hospitals
 *
 * variant:
 *   'default'  → horizontal logo, transparent bg  (logo.svg-removebg-preview.png)
 *   'dark'     → horizontal logo, dark variant    (logo-dark.svg-removebg-preview.png)
 *   'white'    → white version                    (logo-white.svg-removebg-preview.png)
 *   'icon'     → square icon mark                 (logo-icon.svg-removebg-preview.png)
 *   'favicon'  → favicon mark                     (favicon.svg-removebg-preview.png)
 *
 * height: px (default 40)
 */
export default function Logo({ variant = 'default', height = 40, className = '' }) {
  const MAP = {
    default: '/logo.svg-removebg-preview.png',
    dark:    '/logo-dark.svg-removebg-preview.png',
    white:   '/logo-white.svg-removebg-preview.png',
    icon:    '/logo-icon.svg-removebg-preview.png',
    favicon: '/favicon.svg-removebg-preview.png',
  }

  return (
    <img
      src={MAP[variant] ?? MAP.default}
      alt="Deepthi Hospitals"
      style={{ height: `${height}px`, width: 'auto', display: 'block', objectFit: 'contain' }}
      className={className}
    />
  )
}
