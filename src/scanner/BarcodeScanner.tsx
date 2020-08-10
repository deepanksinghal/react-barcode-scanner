import React, { useRef, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { scanBarcode, cropVideo } from './scanner';

interface ScannerProps {
  onSuccess: Function;
  active: boolean;
  tryHarder?: boolean;
  ignoreDuplicateCode?: number;
}

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
    position: 'absolute',
    boxSizing: 'border-box',
    border: '1px solid red',
    transform: `translateZ(0) scale(-1,1)`,
  },
});

const BarcodeScanner: React.FC<ScannerProps> = ({
  onSuccess,
  active,
  tryHarder = false,
  ignoreDuplicateCode = 0,
}) => {
  const scannerRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const laserBoxRef = useRef<HTMLDivElement>(null);
  const classes = useStyles();

  useLayoutEffect(() => {
    async function init() {
      const video = scannerRef.current;

      if (video && active) {
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

  const tick = () => {
    if (!canvasRef.current || !scannerRef.current) {
      return;
    }
    if (scannerRef.current.readyState === scannerRef.current.HAVE_ENOUGH_DATA) {
      const croppedVideo = cropVideo(scannerRef.current);
      canvasRef.current.height = croppedVideo.height;
      canvasRef.current.width = croppedVideo.width;

      const canvas = canvasRef.current.getContext('2d');
      canvas!.drawImage(
        scannerRef.current,
        croppedVideo.xOffset,
        croppedVideo.yOffset,
        croppedVideo.width,
        croppedVideo.height,
        0,
        0,
        croppedVideo.width,
        croppedVideo.height
      );
      const code = scanBarcode(
        canvas!.getImageData(0, 0, croppedVideo.width, croppedVideo.height),
        tryHarder
      );
      if (code.format) {
        onSuccess(code);
      }
    }
    requestAnimationFrame(tick);
  };

  return active ? (
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
  ) : null;
};

export default BarcodeScanner;
