const img = document.getElementById("picture")
const frame = document.getElementById("frame")

const scaleFactor = 2
img.onload = () => {
  const frameCoords = (event) => [
    (event.offsetX - originX) * scale + originX,
    (event.offsetY - originY) * scale + originY
  ]
  const limitOrigin = () => {
    originX = Math.max(0, Math.min(frame.clientWidth, originX))
    originY = Math.max(0, Math.min(frame.clientHeight, originY))
  }

  let scale = 1
  let originX = 0
  let originY = 0
  img.style.transformOrigin = `${originX}px ${originY}px`
  img.style.transform = `scale(${scale})`
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

  let dragging = false
  img.onmousedown = () => dragging = true
  img.onmouseup = () => dragging = false
  img.onmouseleave = () => dragging = false
  img.onmousemove = (event) => {
    if (!dragging || scale === 1) {
      return
    }
    const d = 1 - scale
    originX = event.movementX / d + originX
    originY = event.movementY / d + originY
    limitOrigin()
    img.style.transformOrigin = `${originX}px ${originY}px`
  }
}