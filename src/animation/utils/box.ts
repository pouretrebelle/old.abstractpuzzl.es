export interface Box
  extends Pick<DOMRect, 'top' | 'left' | 'width' | 'height'> {}

export const getBox = (element: Element, buffer: number = 0): Box => {
  const { top, left, width, height } = element.getBoundingClientRect()
  return {
    top: top - buffer,
    left: left - buffer,
    width: width + buffer * 2,
    height: height + buffer * 2,
  }
}
