import ZXing from './zxing_reader';
import { Howl } from 'howler';

let zxing: any;
ZXing().then((instance: any) => (zxing = instance));

const barcodeSymbologies = 'EAN_13|EAN_8|CODE_39|CODE_93|CODE_128|UPC_A|UPC_E';
const filterBarcodesMap = new Map<string, number>();

export type BarcodeResult = {
  error: string;
  format: string;
  text: string;
};

export function scanBarcode(imageData: ImageData, tryHarder: boolean) {
  const sourceBuffer = imageData.data;

  const buffer = zxing._malloc(sourceBuffer.byteLength);
  zxing.HEAPU8.set(sourceBuffer, buffer);
  const result: BarcodeResult = zxing.readBarcodeFromPixmap(
    buffer,
    imageData.width,
    imageData.height,
    tryHarder,
    barcodeSymbologies
  );
  zxing._free(buffer);
  return result;
}

export function isDuplicate(
  barcode: string,
  intervalInMilliSecs: number
): boolean {
  if (
    filterBarcodesMap.has(barcode) &&
    new Date().getTime() - filterBarcodesMap.get(barcode)! <=
      intervalInMilliSecs
  ) {
    return true;
  }

  return addNewBarcode(barcode);
}

function addNewBarcode(barcode: string): boolean {
  filterBarcodesMap.set(barcode, new Date().getTime());
  return false;
}

export function cropVideo(videoElement: HTMLVideoElement) {
  const xOffset = videoElement.videoWidth * 0.139;
  const yOffset = videoElement.videoHeight * 0.3575;
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
