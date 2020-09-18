export const randomInteger = (min: number, max: number): number => {
  if (max === undefined) {
    max = min
    min = 0
  }

  return Math.floor(Math.random() * (max + 1 - min)) + min
}

export const random = (min: number, max: number): number => {
  if (min === undefined) {
    min = 0
    max = 1
  } else if (max === undefined) {
    max = min
    min = 0
  }

  return Math.random() * (max - min) + min
}

export const map = (
  value: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number,
  clampResult?: boolean
): number => {
  var returnvalue = ((value - min1) / (max1 - min1)) * (max2 - min2) + min2
  if (clampResult) return clamp(returnvalue, min2, max2)
  else return returnvalue
}

export const clamp = (value: number, min: number, max: number): number => {
  if (max < min) {
    var temp = min
    min = max
    max = temp
  }

  return Math.max(min, Math.min(value, max))
}

export const roundToDecimalPlace = (num: number, degree: number): number =>
  Math.round(num * Math.pow(10, degree)) / Math.pow(10, degree)
