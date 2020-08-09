import React, { useRef, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import ZXing from './lib/zxing_reader';

interface ScannerProps {
  onScan: Function;
}

let zxing: any;
ZXing().then((instance: any) => (zxing = instance));

const useStyles = makeStyles({
  root: {
    margin: 0,
    padding: 0,
  },
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: -100,
  },
  scanVideo: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'block',
    transform: `scale(-1,1)`,
    objectFit: 'cover',
  },
  laserBox: {
    zIndex: 10,
    position: 'absolute',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    transform: `translateZ(0)`,
    display: 'flex',
    alignItems: 'center',
    left: '13.9%',
    width: '71.25%',
    top: '45.25%',
    height: '9.5%',

    // left: `${(0.025 + 0.12 * 0.95) * 100}%`,
    // width: `${0.75 * 0.95 * 100}%`,
    // top: `${(0.025 + 0.4 * 0.95) * 100}%`,
    // height: `${0.1 * 0.95 * 100}%`,
  },
  laserImg: {
    position: 'absolute',
    width: '100%',
    maxHeight: '47px',
    transition: 'opacity 0.25s ease',
    animationDuration: '0.25s',
  },
  canvas: {
    zIndex: 50,
    position: 'absolute',
    boxSizing: 'border-box',
    border: '1px solid red',
    transform: `translateZ(0) scale(-1,1)`,
  },
});

const BarcodeScanner: React.FC<ScannerProps> = ({ onScan }) => {
  const scannerRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const laserBoxRef = useRef<HTMLDivElement>(null);
  const classes = useStyles();

  useLayoutEffect(() => {
    async function init() {
      const video = scannerRef.current;

      if (video) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        video.srcObject = stream;
        requestAnimationFrame(tick);
      }
    }
    init();
  });

  function scanBarcode(canvasElement: HTMLCanvasElement, format: string) {
    var imgWidth = canvasElement.width;
    var imgHeight = canvasElement.height;
    var imageData = canvasElement
      .getContext('2d')!
      .getImageData(0, 0, imgWidth, imgHeight);
    var sourceBuffer = imageData.data;

    var buffer = zxing._malloc(sourceBuffer.byteLength);
    zxing.HEAPU8.set(sourceBuffer, buffer);
    var result = zxing.readBarcodeFromPixmap(
      buffer,
      imgWidth,
      imgHeight,
      true,
      format
    );
    zxing._free(buffer);
    return result;
  }

  const tick = () => {
    if (!canvasRef.current || !scannerRef.current) {
      return;
    }
    if (scannerRef.current.readyState === scannerRef.current.HAVE_ENOUGH_DATA) {
      canvasRef.current.height = scannerRef.current.videoHeight * 0.095;
      canvasRef.current.width = scannerRef.current.videoWidth * 0.7125;

      const xOffset = scannerRef.current.videoWidth * 0.139;
      const yOffset = scannerRef.current.videoHeight * 0.4525;
      const croppedWidth = scannerRef.current.videoWidth * 0.7125;
      const croppedHeight = scannerRef.current.videoHeight * 0.095;

      const canvas = canvasRef.current.getContext('2d');
      canvas!.drawImage(
        scannerRef.current,
        xOffset,
        yOffset,
        croppedWidth,
        croppedHeight,
        0,
        0,
        croppedWidth,
        croppedHeight
      );

      const code = scanBarcode(canvasRef.current, 'CODE_39');
      if (code.error) {
        console.log(code);
      } else if (code.format) {
        console.log(code);
      } else {
        // console.log(code);
      }
    }
    requestAnimationFrame(tick);
  };

  return (
    <div className={classes.container}>
      <canvas ref={canvasRef} className={classes.canvas} hidden></canvas>
      <video
        ref={scannerRef}
        muted
        autoPlay
        playsInline
        className={classes.scanVideo}
      ></video>
      <div ref={laserBoxRef} className={classes.laserBox}>
        <img
          src="/assets/laser.png"
          alt="laser"
          className={classes.laserImg}
        ></img>
      </div>
    </div>
  );
};

export default BarcodeScanner;
