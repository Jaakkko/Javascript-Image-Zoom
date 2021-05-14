const img = document.getElementById("picture")
const frame = document.getElementById("frame")
const container = document.getElementById("container")

let frameClientX = 0
let frameClientY = 0
let frameWidth = 0
let frameHeight = 0

let scale = 1
let originX = 0
let originY = 0
const transform = {
  scale(frameX, frameY, scaleFactor) {
    const imageX = (frameX - originX) / scale + originX
    const imageY = (frameY - originY) / scale + originY

    // update scale
    scale = Math.max(1, scale * scaleFactor)

    // update origin
    const d = 1 - scale
    if (d !== 0) {
      originX = (frameX - imageX * scale) / d
      originY = (frameY - imageY * scale) / d
      limitOrigin()
    }

    img.style.transformOrigin = `${originX}px ${originY}px`
    img.style.transform = `scale(${scale})`
  },
  translate(imageDeltaX, imageDeltaY) {
    if (scale === 1) {
      return
    }
    const d = (1 - scale) * window.devicePixelRatio
    originX = imageDeltaX / d + originX
    originY = imageDeltaY / d + originY
    limitOrigin()
    img.style.transformOrigin = `${originX}px ${originY}px`
  }
}

const updateFrameCoords = () => {
  const { left, top } = frame.getBoundingClientRect()
  frameClientX = left + frame.clientLeft
  frameClientY = top + frame.clientTop
}

const updatePictureDimensions = () => {
  container.style.maxHeight = `${window.innerHeight}px`
  const width = img.naturalWidth / img.naturalHeight * window.innerHeight
  frame.style.width = `min(${width}px, 100%)`
}

const limitOrigin = () => {
  originX = Math.max(0, Math.min(frameWidth, originX))
  originY = Math.max(0, Math.min(frameHeight, originY))
}

window.onload = () => {
  updateFrameCoords()
  frameWidth = frame.clientWidth
  frameHeight = frame.clientHeight

  updatePictureDimensions()

  img.style.transformOrigin = `${originX}px ${originY}px`
  img.style.transform = `scale(${scale})`

  window.onresize = () => {
    updatePictureDimensions()
    updateFrameCoords()
    originX = originX / frameWidth * frame.clientWidth
    originY = originY / frameHeight * frame.clientHeight
    img.style.transformOrigin = `${originX}px ${originY}px`
    frameWidth = frame.clientWidth
    frameHeight = frame.clientHeight
  }

  frame.onwheel = event => {
    event.preventDefault()
    const frameX = event.clientX - frameClientX
    const frameY = event.clientY - frameClientY
    if (frameX < 0 || frameWidth < frameX || frameY < 0 || frameHeight < frameY) {
      return
    }

    const scaleFactor = event.deltaY < 0 ? 1.1 : (1 / 1.1)
    transform.scale(frameX, frameY, scaleFactor)
  }

  let evCache = new Array()
  let prevDiff = -1
  const onMove = event => {
    for (let i = 0; i < evCache.length; i++) {
      if (event.pointerId === evCache[i].pointerId) {
        evCache[i] = event
        break
      }
    }

    switch (evCache.length) {
      case 1:
        transform.translate(event.movementX, event.movementY)
        break
      case 2:
        {
          const x1 = evCache[0].clientX - frameClientX
          const x2 = evCache[1].clientX - frameClientX
          const y1 = evCache[0].clientY - frameClientY
          const y2 = evCache[1].clientY - frameClientY

          const frameX = (x1 + x2) / 2
          const frameY = (y1 + y2) / 2

          const curDiff = Math.hypot(x1 - x2, y1 - y2)
          if (prevDiff !== -1) {
            transform.translate(event.movementX / 2, event.movementY / 2)
            transform.scale(frameX, frameY, curDiff / prevDiff)
          }
          prevDiff = curDiff
          break
        }
    }
  }

  img.onpointerdown = (e) => {
    prevEvent = e
    evCache.push(e)
    img.onpointermove = onMove
    img.setPointerCapture(e.pointerId)
  }
  img.onpointerup = (event) => {
    for (let i = 0; i < evCache.length; i++) {
      if (event.pointerId === evCache[i].pointerId) {
        evCache.splice(i, 1)
        break
      }
    }
    prevDiff = -1
    img.onpointermove = null
    img.releasePointerCapture(event.pointerId)
  }
}