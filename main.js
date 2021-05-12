const img = document.getElementById("picture")
const frame = document.getElementById("frame")

let frameWidth = 0
let frameHeight = 0

let scale = 1
let originX = 0
let originY = 0

const frameCoords = (event) => [
  (event.offsetX - originX) * scale + originX,
  (event.offsetY - originY) * scale + originY
]
const limitOrigin = () => {
  originX = Math.max(0, Math.min(frameWidth, originX))
  originY = Math.max(0, Math.min(frameHeight, originY))
}

img.onload = () => {
  frameWidth = frame.clientWidth
  frameHeight = frame.clientHeight

  img.style.transformOrigin = `${originX}px ${originY}px`
  img.style.transform = `scale(${scale})`

  window.onresize = () => {
    originX = originX / frameWidth * frame.clientWidth
    originY = originY / frameHeight * frame.clientHeight
    img.style.transformOrigin = `${originX}px ${originY}px`
    frameWidth = frame.clientWidth
    frameHeight = frame.clientHeight
  }

  img.onwheel = event => {
    event.preventDefault()

    const [frameX, frameY] = frameCoords(event)

    // update scale
    const scaleFactor = event.deltaY < 0 ? 1.1 : (1 / 1.1)
    scale = Math.max(1, scale * scaleFactor)

    // update origin
    const d = 1 - scale
    if (d !== 0) {
      originX = (frameX - event.offsetX * scale) / d
      originY = (frameY - event.offsetY * scale) / d
      limitOrigin()
    }

    img.style.transformOrigin = `${originX}px ${originY}px`
    img.style.transform = `scale(${scale})`
  }

  function translate(event) {
    if (scale === 1) {
      return
    }
    const d = (1 - scale) * window.devicePixelRatio
    originX = event.movementX / d + originX
    originY = event.movementY / d + originY
    limitOrigin()
    img.style.transformOrigin = `${originX}px ${originY}px`
  }

  img.onpointerdown = (e) => {
    img.onpointermove = translate
    img.setPointerCapture(e.pointerId)
  }
  img.onpointerup = (e) => {
    img.onpointermove = null
    img.releasePointerCapture(e.pointerId)
  }
}