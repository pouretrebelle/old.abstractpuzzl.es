import { triggerCelebration } from './celebration'
import { settings, setup } from './settings'

const touchedTriggers: number[] = []

export const setupTriggers = () => {
  const { paths } = setup
  document.body.style.setProperty('cursor', 'crosshair')
  const triggers = Array.from(paths)

  triggers.forEach((trigger, index) => {
    trigger.setAttribute('index', String(index))
    trigger.addEventListener(
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

const clearPiece = (index: number) => {
  const { paths } = setup
  const { rows, columns } = settings

  if (touchedTriggers.indexOf(index) !== -1) return

  touchedTriggers.push(index)
  const path = paths[index]
  if (touchedTriggers.length === rows * columns) onPuzzleCompletion(path)

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

const onPuzzleCompletion = (lastPath: HTMLElement) => {
  document.removeEventListener('touchmove', onTouchMove)

  const transitionSpeed = parseInt(
    lastPath.style.getPropertyValue('--transition-speed')
  )

  window.setTimeout(() => {
    document.body.style.removeProperty('cursor')
  }, transitionSpeed)
  window.setTimeout(triggerCelebration, transitionSpeed)
}
