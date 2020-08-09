import React from 'react';
import BarcodeScanner from './BarcodeScanner';

function App() {
  return <BarcodeScanner onScan={() => console.log('OK')} />;
}

export default App;
