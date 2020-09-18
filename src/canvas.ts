import Vector2 from './utils/Vector2'
import { random, randomInteger, map } from './utils/numberUtils'

let screenWidth = window.innerWidth
let screenHeight = window.innerHeight
let screenMin = screenWidth < screenHeight ? screenWidth : screenHeight

const canvas = document.createElement('canvas')
canvas.width = screenWidth
canvas.height = screenHeight
document.body.appendChild(canvas)

interface Box extends Pick<DOMRect, 'top' | 'left' | 'width' | 'height'> {
  middle: Vector2
}

const getBox = (element: Element): Box => {
  const { top, left, width, height } = element.getBoundingClientRect()
  const middle = new Vector2(left + width / 2, top + height / 2)
  return { top, left, width, height, middle }
}

const puzzle = document.getElementById('puzzle') as HTMLElement
const avoid = Array.from(document.getElementsByClassName('js-avoid'))
const avoidBoxes = avoid.map(getBox)

const background: {
  c: CanvasRenderingContext2D
  dots: Dot[]
  rows: number
  columns: number
  avoidBoxes: Box[]
  avoidPuzzle: Box
} = {
  c: canvas.getContext('2d') as CanvasRenderingContext2D,
  dots: [],
  rows: 14,
  columns: 14,
  avoidBoxes: avoidBoxes,
  avoidPuzzle: getBox(puzzle),
}

const setup = () => {
  const { rows, columns } = background
  const { top, left, width, height } = background.avoidPuzzle
  const middle = new Vector2(left + width / 2, top + height / 2)
  const cardinalMiddleToEdge = width / 2 + 10

  for (let i = 0; i < rows * columns; i++) {
    const row = i % rows
    const column = Math.floor(i / columns)
    const startX = left + ((column + 0.5) / columns) * width
    const startY = top + ((row + 0.5) / rows) * height
    const w = width / columns
    const h = height / rows
    const color = `rgb(${
      column === 0 || column === columns - 1 || row === 0 || row === rows - 1
        ? 0
        : 255
    }, ${map(row, 0, rows, 0, 255)}, ${map(column, 0, columns, 0, 255)})`

    const pos = new Vector2(startX, startY)
    const vecFromMiddle = pos.minusNew(middle)
    const vecFromMiddleMag = vecFromMiddle.magnitude()
    vecFromMiddle.normalise()
    const normalMultiplier = Math.max(
      Math.abs(vecFromMiddle.x),
      Math.abs(vecFromMiddle.y)
    )
    const fullDist = cardinalMiddleToEdge / normalMultiplier - vecFromMiddleMag
    const push = vecFromMiddle.multiplyEq(fullDist * 2.2)
    pos.plusEq(push)

    const randomDir = new Vector2(0, randomInteger(1, 5))
    randomDir.rotate(random(0, Math.PI))

    pos.plusEq(randomDir)

    const dot = new Dot(pos.x, pos.y, row, column, w, h, color, i)

    background.dots.push(dot)
  }

  const { dots } = background

  const availablePixels = avoidBoxes.reduce(
    (prev, { width, height }) => prev - width * height,
    screenWidth * screenHeight
  )

  // divide the available space on the page by each dot
  const avoidDistance = Math.sqrt(availablePixels / dots.length)

  const DOT_DRAW_FRAMES = 0
  for (let t = 0; t < DOT_DRAW_FRAMES; t++) {
    dots.forEach((dot) => {
      dot.update(avoidDistance)
    })
  }
}

// let frames = 0
const draw = () => {
  // console.log(frames++)
  const { dots, avoidBoxes, c } = background
  c.clearRect(0, 0, screenWidth, screenHeight)

  // c.strokeStyle = 'red'
  // avoidBoxes.forEach(({ top, left, width, height }) => {
  //   c.strokeRect(left, top, width, height)
  // })

  const availablePixels = avoidBoxes.reduce(
    (prev, { width, height }) => prev - width * height,
    screenWidth * screenHeight
  )

  // divide the available space on the page by each dot
  const avoidDistance = Math.sqrt(availablePixels / dots.length)

  dots.forEach((dot) => {
    // dot.update(avoidDistance)
    dot.draw(c)
  })
}

class Dot {
  color: string
  w: number
  h: number
  // row: number
  // column: number
  pos: Vector2
  vel: Vector2
  rot: number
  i: number

  constructor(
    x: number,
    y: number,
    row: number,
    column: number,
    w: number,
    h: number,
    color: string,
    index: number
  ) {
    this.color = color
    this.w = w
    this.h = h
    this.pos = new Vector2(x, y)
    this.vel = new Vector2(0, 0)
    this.rot = randomInteger(50, 100) * (Math.random() < 0.5 ? -1 : 1)
    this.i = index
  }

  avoid(pos: Vector2, multiplier: number) {
    const nudge = this.pos.minusNew(pos).normalise().multiplyEq(multiplier)
    this.vel.plusEq(nudge)
  }

  move(pos: Vector2, multiplier: number) {
    const nudge = this.pos.minusNew(pos).normalise().multiplyEq(multiplier)
    this.pos.plusEq(nudge)
  }

  update(avoidDistance: number) {
    const { dots, avoidBoxes, avoidPuzzle } = background
    // bounce off walls
    // if (this.pos.x < 0 || this.pos.x > screenWidth) this.vel.x = -this.vel.x
    // if (this.pos.y < 0 || this.pos.y > screenHeight) this.vel.y = -this.vel.y

    dots.forEach((dot) => {
      if (dot === this) return
      // add speed away from
      if (this.pos.dist(dot.pos) < avoidDistance) {
        this.avoid(dot.pos, 0.1)
      }
      // push away when too close
      if (this.pos.dist(dot.pos) < this.w) {
        this.move(dot.pos, 1)
      }
    })

    // avoid boxs
    avoidBoxes.forEach((box) => {
      if (
        this.pos.x > box.left &&
        this.pos.x < box.left + box.width &&
        this.pos.y > box.top &&
        this.pos.y < box.top + box.height
      ) {
        this.avoid(box.middle, 0.2)
      }
    })

    // avoid middle of puzzle
    const buffer = 30
    if (
      this.pos.x > avoidPuzzle.left - buffer &&
      this.pos.x < avoidPuzzle.left + avoidPuzzle.width + buffer &&
      this.pos.y > avoidPuzzle.top - buffer &&
      this.pos.y < avoidPuzzle.top + avoidPuzzle.height + buffer
    ) {
      this.avoid(avoidPuzzle.middle, 0.2)
    }

    // gravity to center
    this.vel.plusEq(
      avoidPuzzle.middle.minusNew(this.pos).normalise().multiplyEq(0.02)
    )

    // limit speed
    if (this.vel.magnitude() > 1) this.vel.normalise()

    // always be slowing down
    this.vel.multiplyEq(0.95)

    // add velocity to position
    this.pos.plusEq(this.vel)
  }

  draw(c: CanvasRenderingContext2D) {
    c.save()

    c.translate(this.pos.x, this.pos.y)
    c.rotate(this.rot)

    c.fillStyle = this.color
    c.fillRect(-this.w / 2, -this.h / 2, this.w, this.h)

    c.restore()
  }
}

const loop = () => {
  draw()
  window.requestAnimationFrame(loop)
}

const init = () => {
  setup()
  window.requestAnimationFrame(loop)
}

window.addEventListener('load', init)

export default 'hello'
