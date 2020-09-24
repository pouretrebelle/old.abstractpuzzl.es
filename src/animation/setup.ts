import { getBox } from './utils/box'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
const screenMin = screenWidth < screenHeight ? screenWidth : screenHeight

const puzzle = document.getElementById('puzzle') as HTMLElement
const avoid = Array.from(document.getElementsByClassName('js-avoid'))
const avoidBoxes = avoid.map((element) =>
  getBox(element, Math.min(screenMin * 0.03, 20))
)

export const setup = {
  screenWidth,
  screenHeight,
  screenMin,
  avoidBoxes: [getBox(puzzle, Math.min(screenMin * 0.03, 30)), ...avoidBoxes],
  puzzleBox: getBox(puzzle),
  paths: document.querySelectorAll('#puzzle path') as NodeListOf<
    SVGGraphicsElement
  >,
  viewBox: {
    x: 1000,
    y: 1000,
  },
}
