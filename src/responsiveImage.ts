// @ts-ignore
import puzzleImagesTemp from './assets/puzzle.png?{sizes:[400,600,800,1000,1200,1500,2000,2500]}'
const puzzleImages = puzzleImagesTemp as ResponsiveImageOutput

interface SingleResponsiveImageOutput {
  path: string
  width: number
  height: number
}

interface ResponsiveImageOutput {
  images: SingleResponsiveImageOutput[]
}

const puzzleContainer = document.getElementById('puzzle') as Element
const puzzleImageElement = document.getElementById('puzzle-image') as Element

const minImageWidth =
  puzzleContainer.clientWidth * (window.devicePixelRatio || 1)

const pickedImage = puzzleImages.images.find(
  (image) => image.width > minImageWidth
) as SingleResponsiveImageOutput

puzzleImageElement.setAttribute('xlink:href', pickedImage.path)
