import React, { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { scanBarcode, cropVideo, isDuplicate } from './scanner';

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
    // transform: `scale(-1,1)`,
    // WebkitTransform: `scale(-1,1)`,
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
    // transform: `translateZ(0) scale(-1,1)`,
    // WebkitTransform: `translateZ(0) scale(-1,1)`,
  },
});

const BarcodeScanner: React.FC<ScannerProps> = ({
  onSuccess,
  active,
  tryHarder = false,
  ignoreDuplicateCode = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const classes = useStyles();

  const tick = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) {
      return;
    }
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const croppedVideo = cropVideo(videoRef.current);
      canvasRef.current.height = croppedVideo.height;
      canvasRef.current.width = croppedVideo.width;

      const canvas = canvasRef.current.getContext('2d');
      canvas!.drawImage(
        videoRef.current,
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
      if (
        code.format &&
        (ignoreDuplicateCode === 0 ||
          !isDuplicate(code.text, ignoreDuplicateCode))
      ) {
        onSuccess(code);
      }
    }
    if (active) {
      requestAnimationFrame(tick);
    }
  }, [ignoreDuplicateCode, onSuccess, tryHarder, active]);

  useEffect(() => {
    const videoElement = videoRef.current;
    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoElement) {
        videoElement.srcObject = stream;
        requestAnimationFrame(tick);
      }
    }
    if (active && videoElement && !videoElement.srcObject) {
      init();
    } else {
      return function cleanup() {
        if (videoElement) {
          const stream = videoElement.srcObject;
          if (stream) {
            const tracks = (stream as MediaStream).getTracks();
            tracks.forEach(function (track) {
              track.stop();
            });
            videoElement.srcObject = null;
          }
        }
      };
    }
  }, [active, tick]);

  return (
    <div className={classes.container}>
      <canvas ref={canvasRef} className={classes.canvas} hidden></canvas>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className={classes.scanVideo}
      ></video>
      <div className={classes.laserBox}>
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
