import './styles/main.scss'
import './assets/favicon.png'
import './assets/opengraph.jpg'
import './assets/twittercard.jpg'
import './assets/puzzle.png'
import './canvas'

const root = document.documentElement

// let animate = 0
// const callback = () => {
//   animate = animate >= 1 ? 1 : animate + 0.01
//   root.style.setProperty('--animate', animate)

//   window.requestAnimationFrame(callback)
// }
// window.requestAnimationFrame(callback)

const setWindowSize = () => {
  const aspectRatio = window.innerWidth / window.innerHeight
  root.style.setProperty(
    '--windowHeightScalar',
    String(aspectRatio > 1 ? 1 : 1 / aspectRatio)
  )
  root.style.setProperty(
    '--windowWidthScalar',
    String(aspectRatio < 1 ? 1 : aspectRatio)
  )
}
setWindowSize()
window.addEventListener('resize', setWindowSize) // debounce this in production
