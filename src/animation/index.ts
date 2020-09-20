import { placePieces } from './placement'

const { matches: prefersReducedMotion } = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
)
if (!prefersReducedMotion) {
  window.addEventListener('load', placePieces)
}
