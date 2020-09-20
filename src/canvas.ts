import Vector2 from './utils/Vector2'
import { clamp, map, random, randomInteger } from './utils/numberUtils'

let screenWidth = window.innerWidth
let screenHeight = window.innerHeight
let screenMin = screenWidth < screenHeight ? screenWidth : screenHeight

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
const avoidBoxes = avoid.map((element) =>
  getBox(element, Math.min(screenMin * 0.03, 20))
)

const background: {
  rows: number
  columns: number
  avoidBoxes: Box[]
  puzzle: Box
  placedPieces: Vector2[]
} = {
  rows: 14,
  columns: 14,
  avoidBoxes: [getBox(puzzle, Math.min(screenMin * 0.03, 30)), ...avoidBoxes],
  puzzle: getBox(puzzle),
  placedPieces: [],
}

const paths = document.querySelectorAll('#puzzle path') as NodeListOf<
  HTMLElement
>

const PLACEMENT_ATTEMPTS = 500

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

const init = () => {
  const { rows, columns } = background
  const { top, left, width, height } = background.puzzle
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

    background.placedPieces.push(pos)

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

const setupTriggers = () => {
  document.body.style.setProperty('cursor', 'crosshair')
  const triggers = Array.from(document.querySelectorAll('#puzzle path'))
  const touchedTriggers: number[] = []

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

  const onTouchMove = (e: TouchEvent) => {
    Array.from(e.touches).forEach((touch) => {
      const element = document.elementFromPoint(touch.pageX, touch.pageY)
      if (!element) return

      const index = element.getAttribute('index')

      if (!index) return

      clearPiece(parseInt(index, 10))
    })
  }
  document.addEventListener('touchmove', onTouchMove)

  const clearPiece = (index: number) => {
    if (touchedTriggers.indexOf(index) !== -1) return

    touchedTriggers.push(index)
    const path = paths[index]
    if (touchedTriggers.length === triggers.length) onPuzzleCompletion(path)

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
    window.setTimeout(celebrate, transitionSpeed)
  }
}

const spark = new Path2D(
  'M-5 1c-.6 0-1-.4-1-1s.4-1 1-1c4 0 4-5 4-7 0-.6.4-1 1-1s1 .4 1 1c0 2 0 7 4 7 .6 0 1 .4 1 1s-.4 1-1 1C1 1 1 6 1 8c0 .6-.4 1-1 1s-1-.4-1-1c0-2 0-7-4-7z'
)

class Spark {
  canvasWidth: number
  canvasHeight: number
  x: number
  y: number
  scale: number
  through: number
  speed: number

  constructor({
    canvasWidth,
    canvasHeight,
    start,
  }: {
    canvasWidth: number
    canvasHeight: number
    start: number
  }) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.x = 0
    this.y = 0
    this.scale = 0
    this.through = start
    this.speed = random(0.005, 0.015)
    this.position()
  }

  position() {
    const scale = Math.pow(random(0.75, 1.75), 3)
    this.x = random(12 * scale, this.canvasWidth - 12 * scale)
    this.y = random(18 * scale, this.canvasHeight - 18 * scale)
    this.scale = scale
  }

  draw(c: CanvasRenderingContext2D) {
    if (this.through < 0) return

    c.save()
    c.translate(this.x, this.y)
    const curScale = map(
      Math.pow(Math.sin(this.through * Math.PI), 2),
      0,
      1,
      this.scale * 0.5,
      this.scale
    )
    c.globalAlpha = Math.sin(this.through * Math.PI)
    c.scale(curScale, curScale)
    c.fill(spark)
    c.restore()
  }

  update() {
    this.through += this.speed
    if (this.through >= 1) {
      this.position()
      this.through = 0
    }
  }
}

const celebrate = () => {
  const canvas = document.getElementById(
    'puzzle-celebration'
  ) as HTMLCanvasElement

  const { clientWidth: width, clientHeight: height } = canvas

  const pixelDensity = window.devicePixelRatio || 1
  canvas.width = width * pixelDensity
  canvas.height = height * pixelDensity

  const c = canvas.getContext('2d') as CanvasRenderingContext2D
  c.scale(pixelDensity, pixelDensity)
  c.fillStyle = 'white'

  const sparks: Spark[] = []
  for (let i = 0; i < 20; i++) {
    sparks.push(
      new Spark({ canvasWidth: width, canvasHeight: height, start: -i / 10 })
    )
  }

  const draw = () => {
    c.clearRect(0, 0, width, height)
    sparks.forEach((spark) => {
      spark.update()
      spark.draw(c)
    })

    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
}

window.addEventListener('load', init)
