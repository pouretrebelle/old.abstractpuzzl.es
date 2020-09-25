import { placePieces } from './placement'

const { matches: prefersReducedMotion } = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
)
if (prefersReducedMotion) {
  const puzzle = document.getElementById('puzzle')
  puzzle?.classList.remove('js-hidden')
} else {
  window.addEventListener('load', placePieces)
}
