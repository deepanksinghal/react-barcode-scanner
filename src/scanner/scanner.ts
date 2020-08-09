import ZXing from './zxing_reader';
import { Howl } from 'howler';

let zxing: any;
ZXing().then((instance: any) => (zxing = instance));

const barcodeSymbologies = 'EAN_13|EAN_8|CODE_39|CODE_93|CODE_128|UPC_A|UPC_E';

export type BarcodeResult = {
  error: string;
  format: string;
  text: string;
};

export function scanBarcode(
  canvasElement: HTMLCanvasElement,
  tryHarder: boolean,
  ignoreDuplicateCodeTime: number
) {
  const imgWidth = canvasElement.width;
  const imgHeight = canvasElement.height;
  const imageData = canvasElement
    .getContext('2d')!
    .getImageData(0, 0, imgWidth, imgHeight);
  const sourceBuffer = imageData.data;

  const buffer = zxing._malloc(sourceBuffer.byteLength);
  zxing.HEAPU8.set(sourceBuffer, buffer);
  const result: BarcodeResult = zxing.readBarcodeFromPixmap(
    buffer,
    imgWidth,
    imgHeight,
    tryHarder,
    barcodeSymbologies
  );
  zxing._free(buffer);
  return result;
}

export function cropVideo(videoElement: HTMLVideoElement) {
  const xOffset = videoElement.videoWidth * 0.139;
  const yOffset = videoElement.videoHeight * 0.4525;
  const width = videoElement.videoWidth * 0.7125;
  const height = videoElement.videoHeight * 0.095;

  return { xOffset, yOffset, width, height };
}

export const beepSound = new Howl({
  src: ['/assets/beep.mp3'],
});

export const buzzSound = new Howl({
  src: ['/assets/buzz.mp3'],
});
