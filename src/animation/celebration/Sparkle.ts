import { map, random } from '../utils/numberUtils'

const sparklePath = new Path2D(
  'M-5 1c-.6 0-1-.4-1-1s.4-1 1-1c4 0 4-5 4-7 0-.6.4-1 1-1s1 .4 1 1c0 2 0 7 4 7 .6 0 1 .4 1 1s-.4 1-1 1C1 1 1 6 1 8c0 .6-.4 1-1 1s-1-.4-1-1c0-2 0-7-4-7z'
)

export class Sparkle {
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
    const scale = Math.pow(random(0.75, 1.5), 3)
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
    c.fill(sparklePath)
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
