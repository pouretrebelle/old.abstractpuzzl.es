import { Sparkle } from './Sparkle'

const sparkles: Sparkle[] = []

export const triggerCelebration = () => {
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

  for (let i = 0; i < 20; i++) {
    sparkles.push(
      new Sparkle({ canvasWidth: width, canvasHeight: height, start: -i / 10 })
    )
  }

  const draw = () => {
    c.clearRect(0, 0, width, height)
    sparkles.forEach((sparkle) => {
      sparkle.update()
      sparkle.draw(c)
    })

    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
}
