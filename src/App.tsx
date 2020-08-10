import React from 'react';
import BarcodeScanner from './scanner/BarcodeScanner';
import { BarcodeResult } from './scanner/scanner';

function App() {
  return (
    <BarcodeScanner
      onSuccess={(barcode: BarcodeResult) => console.log(barcode)}
      active={true}
      tryHarder={false}
      ignoreDuplicateCode={5000}
    />
  );
}

export default App;
