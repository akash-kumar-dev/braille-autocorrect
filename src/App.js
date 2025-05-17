import BrailleAutocorrect from "./components/BrailleAutocorrect"

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Braille Autocorrect System</h1>
          <p className="mt-2 text-gray-600">An intelligent autocorrect and suggestion system for Braille input</p>
        </header>
        <main>
          <BrailleAutocorrect />
        </main>
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Braille Autocorrect and Suggestion System</p>
          <p className="mt-1">offsecoff Private Limited</p>
        </footer>
      </div>
    </div>
  )
}

export default App
