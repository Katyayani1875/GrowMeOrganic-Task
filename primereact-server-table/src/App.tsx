import ArtworksTable from './components/ArtworksTable.tsx';
function App() {
  return (
    // Main container for the whole page with padding
    <main className="w-full min-h-screen p-4 sm:p-6 md:p-8 bg-slate-100">
      <div 
        // This is the main "glassmorphism" card
        className="w-full max-w-screen-2xl mx-auto bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-300/20 p-6 md:p-8 ring-1 ring-black/5"
      >
        <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-slate-800 mb-2 text-center">
          Art Institute of Chicago
        </h1>
        <p className="text-center text-slate-500 mb-8 text-lg">
          Explore The Collection
        </p>
        <ArtworksTable />
      </div>
    </main>
  );
}

export default App;