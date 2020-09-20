import { clamp, random, randomInteger } from './utils/numberUtils'
import Vector2 from './utils/Vector2'
import { setupTriggers } from './interaction'
import { settings, setup } from './settings'

const PLACEMENT_ATTEMPTS = 500

const placedPieces: Vector2[] = []

const testPlacement = (pos: Vector2, avoidDistance: number) => {
  const { screenWidth, screenHeight, avoidBoxes } = setup

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
  if (avoidDistance > 0) {
    const hitDot = placedPieces.some(
      (piecePos) => pos.dist(piecePos) < avoidDistance
    )
    if (hitDot) return false
  }

  return true
}

const placementVector = new Vector2(0, 1)
const pickPlacement = (pos: Vector2, radius: number) =>
  pos.plusNew(
    placementVector
      .normalise()
      .multiplyEq(random(0, radius))
      .rotate(random(0, Math.PI))
  )

export const placePieces = () => {
  const { rows, columns } = settings
  const { screenWidth, screenHeight, avoidBoxes, puzzleBox, paths } = setup
  const { top, left, width, height } = puzzleBox

  const middle = new Vector2(left + width / 2, top + height / 2)
  const cardinalMiddleToEdge = width / 2 + 10

  const count = rows * columns

  const availablePixels = avoidBoxes.reduce(
    (prev, { width, height }) => prev - width * height,
    screenWidth * screenHeight
  )
  let avoidDistance = Math.max(
    width / columns,
    Math.sqrt(availablePixels / count) * 0.5
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

    // keep proposed position within page
    if (proposedPos.x < 0) proposedPos.x = 0
    if (proposedPos.x > screenWidth) proposedPos.x = screenWidth
    if (proposedPos.y < 0) proposedPos.y = 0
    if (proposedPos.y > screenHeight) proposedPos.y = screenHeight

    const radius = fullDist * 0.5 + 20

    let pos = pickPlacement(proposedPos, radius)
    let tries = 1
    while (
      !testPlacement(pos, avoidDistance - tries / 20) &&
      tries < PLACEMENT_ATTEMPTS
    ) {
      tries++
      pos = pickPlacement(pos, radius + tries / 20)
    }
    if (tries === PLACEMENT_ATTEMPTS) {
      pos = proposedPos
    }

    placedPieces.push(pos)

    const difference = pos.minusNew(startPos).divideEq(width)

    paths[i].style.setProperty(
      '--rotate',
      `${randomInteger(50, 100) * (Math.random() < 0.5 ? -1 : 1)}deg`
    )
    paths[i].style.setProperty('--x', `${difference.x * 100}%`)
    paths[i].style.setProperty('--y', `${difference.y * 100}%`)
    paths[i].style.setProperty(
      '--transition-speed',
      `${Math.floor(clamp(difference.magnitude() * 1000, 200, 400))}ms`
    )
  }

  setupTriggers()
}
