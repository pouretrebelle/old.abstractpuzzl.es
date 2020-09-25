import { triggerCelebration } from './celebration'
import { setup } from './setup'

const touchedTriggers: number[] = []

export const setupTriggers = () => {
  const { paths } = setup
  document.body.style.setProperty('cursor', 'crosshair')

  paths.forEach((path, index) => {
    path.setAttribute('index', String(index))
    path.addEventListener(
      'mouseenter',
      () => {
        clearPiece(index)
      },
      { once: true }
    )
  })
}

const onTouchMove = (e: TouchEvent) => {
  Array.from(e.touches).forEach((touch) => {
    const element = document.elementFromPoint(touch.pageX, touch.pageY)
    if (!element) return

    const index = element.getAttribute('index')
    if (!index) return

    clearPiece(parseInt(index))
  })
}
document.addEventListener('touchmove', onTouchMove)

export const unfurl = () => {
  const { paths } = setup
  paths.forEach((path, index) => {
    setTimeout(() => clearPiece(index), 1000 + index * 150)
  })
}

const clearPiece = (index: number) => {
  const { paths } = setup

  if (touchedTriggers.indexOf(index) !== -1) return

  touchedTriggers.push(index)
  const path = paths[index]
  if (touchedTriggers.length === paths.length) onPuzzleCompletion(path)

  // svg stacking order is the DOM order
  // so we have to move the path to the end to ensure it overlaps other pieces when moving into place
  const parent = path.parentNode as Node
  parent.appendChild(path)
  window.setTimeout(() => {
    path.style.removeProperty('--rotate')
    path.style.removeProperty('--x')
    path.style.removeProperty('--y')
  }, 50)
}

const onPuzzleCompletion = (lastPath: SVGGraphicsElement) => {
  document.removeEventListener('touchmove', onTouchMove)

  const transitionSpeed = parseInt(
    lastPath.style.getPropertyValue('--transition-speed')
  )

  window.setTimeout(() => {
    document.body.style.removeProperty('cursor')
  }, transitionSpeed)
  window.setTimeout(triggerCelebration, transitionSpeed)
}
