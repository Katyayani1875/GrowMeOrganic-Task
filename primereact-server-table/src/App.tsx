// src/App.tsx

// DEFINITIVE FIX: Added the .tsx extension to the import path.
// Modern bundlers and strict TypeScript settings require this for unambiguous module resolution.
import ArtworksTable from './components/ArtworksTable.tsx';
import './App.css';

function App() {
  return (
    <div className="card p-4">
      <h1 className="text-2xl font-bold mb-4">Art Institute of Chicago - Artworks</h1>
      <ArtworksTable />
    </div>
  );
}

export default App;