import React from 'react';
import BarcodeScanner from './scanner/BarcodeScanner';

function App() {
  return <BarcodeScanner onSuccess={() => console.log('OK')} active={true} />;
}

export default App;
