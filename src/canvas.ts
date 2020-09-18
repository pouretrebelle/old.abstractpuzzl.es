import Vector2 from './utils/Vector2'
import { random, randomInteger } from './utils/numberUtils'

let screenWidth = window.innerWidth
let screenHeight = window.innerHeight

interface Box extends Pick<DOMRect, 'top' | 'left' | 'width' | 'height'> {}

const getBox = (element: Element, buffer: number = 0): Box => {
  const { top, left, width, height } = element.getBoundingClientRect()
  return {
    top: top - buffer,
    left: left - buffer,
    width: width + buffer * 2,
    height: height + buffer * 2,
  }
}

const puzzle = document.getElementById('puzzle') as HTMLElement
const avoid = Array.from(document.getElementsByClassName('js-avoid'))
const avoidBoxes = avoid.map((element) => getBox(element, 20))

const background: {
  rows: number
  columns: number
  avoidBoxes: Box[]
  puzzle: Box
  placedPieces: Vector2[]
} = {
  rows: 14,
  columns: 14,
  avoidBoxes: [getBox(puzzle, 30), ...avoidBoxes],
  puzzle: getBox(puzzle),
  placedPieces: [],
}

const PLACEMENT_ATTEMPTS = 1000

const testPlacement = (pos: Vector2, avoidDistance: number) => {
  const { avoidBoxes, placedPieces } = background

  // inside walls
  if (pos.x < 0 || pos.x > screenWidth) return false
  if (pos.y < 0 || pos.y > screenHeight) return false

  // avoid boxes
  const hitBox = avoidBoxes.some(
    (box) =>
      pos.x > box.left &&
      pos.x < box.left + box.width &&
      pos.y > box.top &&
      pos.y < box.top + box.height
  )
  if (hitBox) return false

  // avoid placed pieces
  const hitDot = placedPieces.some(
    (piecePos) => pos.dist(piecePos) < avoidDistance
  )
  if (hitDot) return false

  return true
}

const placementVector = new Vector2(0, 1)
const pickPlacement = (pos: Vector2, radius: number) =>
  pos.plusNew(
    placementVector
      .normalise()
      .multiplyEq(random(radius / 2, radius))
      .rotate(random(0, Math.PI))
  )

const init = () => {
  const { rows, columns } = background
  const { top, left, width, height } = background.puzzle
  const middle = new Vector2(left + width / 2, top + height / 2)
  const cardinalMiddleToEdge = width / 2 + 10
  const paths = document.querySelectorAll('#puzzle path') as NodeListOf<
    HTMLElement
  >

  const count = rows * columns

  const availablePixels = avoidBoxes.reduce(
    (prev, { width, height }) => prev - width * height,
    screenWidth * screenHeight
  )
  let avoidDistance = Math.max(
    width / columns,
    Math.sqrt(availablePixels / count) * 0.75
  )

  for (let i = 0; i < count; i++) {
    const row = i % rows
    const column = Math.floor(i / columns)
    const startX = left + ((column + 0.5) / columns) * width
    const startY = top + ((row + 0.5) / rows) * height
    const startPos = new Vector2(startX, startY)

    paths[i].style.setProperty(
      '--pieceX',
      String(-1 + (2 * (column + 0.5)) / columns)
    )
    paths[i].style.setProperty(
      '--pieceY',
      String(-1 + (2 * (row + 0.5)) / rows)
    )

    const vecFromMiddle = startPos.minusNew(middle)
    const vecFromMiddleMag = vecFromMiddle.magnitude()
    vecFromMiddle.normalise()
    const normalMultiplier = Math.max(
      Math.abs(vecFromMiddle.x),
      Math.abs(vecFromMiddle.y)
    )
    const fullDist = cardinalMiddleToEdge / normalMultiplier - vecFromMiddleMag
    const push = vecFromMiddle.multiplyEq(fullDist * 2.2)
    const proposedPos = startPos.plusNew(push)

    const radius = fullDist + 10

    let pos = pickPlacement(proposedPos, radius)
    let tries = 1
    while (
      !testPlacement(pos, avoidDistance - tries) &&
      tries < PLACEMENT_ATTEMPTS
    ) {
      tries++
      pos = pickPlacement(pos, radius + tries)
    }
    if (tries === PLACEMENT_ATTEMPTS) pos = proposedPos
    console.info(tries)

    background.placedPieces.push(pos)

    const difference = pos.minusNew(startPos).divideEq(width)

    paths[i].style.setProperty(
      '--rotate',
      `${randomInteger(50, 100) * (Math.random() < 0.5 ? -1 : 1)}deg`
    )
    paths[i].style.setProperty('--x', `${difference.x * 100}%`)
    paths[i].style.setProperty('--y', `${difference.y * 100}%`)
  }
}

window.addEventListener('load', init)
