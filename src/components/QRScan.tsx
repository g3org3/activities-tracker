import jsQR from 'jsqr'
import { useEffect } from 'react'

interface Props {
  className?: string
  onFind?: (data: string) => void
}

const QRScan = ({ className, onFind }: Props) => {
  useEffect(() => {
    const video = document.createElement('video')
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
    if (!canvasElement) return

    const canvas = canvasElement.getContext('2d')
    const loadingMessage = document.getElementById('loadingMessage')
    const outputContainer = document.getElementById('output')
    const outputMessage = document.getElementById('outputMessage')
    const outputData = document.getElementById('outputData')

    function drawLine(begin: { x: number; y: number }, end: { x: number; y: number }, color: string) {
      if (!canvas) return

      canvas.beginPath()
      canvas.moveTo(begin.x, begin.y)
      canvas.lineTo(end.x, end.y)
      canvas.lineWidth = 4
      canvas.strokeStyle = color
      canvas.stroke()
    }

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (stream) {
      video.srcObject = stream
      video.setAttribute('playsinline', 'true') // required to tell iOS safari we don't want fullscreen
      video.play()
      requestAnimationFrame(tick)
    })

    function tick() {
      if (!loadingMessage || !canvasElement || !outputContainer || !outputMessage || !outputData) return
      loadingMessage.innerText = '⌛ Loading video...'
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true
        canvasElement.hidden = false
        outputContainer.hidden = false

        canvasElement.height = video.videoHeight
        canvasElement.width = video.videoWidth

        if (!canvas) return
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code) {
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58')
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58')
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58')
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58')
          outputMessage.hidden = true
          if (outputData.parentElement) outputData.parentElement.hidden = false
          outputData.innerText = code.data
          if (typeof onFind === 'function') onFind(code.data)
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream
            stream.getTracks().forEach((track) => track.stop())
          }
        } else {
          outputMessage.hidden = false
          if (outputData.parentElement) outputData.parentElement.hidden = true
        }
      }
      requestAnimationFrame(tick)
    }
  }, [])

  return (
    <div className={className}>
      <div id="loadingMessage">
        🎥 Unable to access video stream (please make sure you have a webcam enabled)
      </div>
      <canvas id="canvas" hidden></canvas>
      <div id="output" hidden>
        <div id="outputMessage">No QR code detected.</div>
        <div hidden>
          <b>Data:</b> <span id="outputData"></span>
        </div>
      </div>
    </div>
  )
}

export default QRScan
