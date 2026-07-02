import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Dashboard from './components/Dashboard'
import FileScanner from './components/FileScanner'
import Sidebar from './components/Sidebar'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [scanResults, setScanResults] = useState(null)

  const handleScanComplete = (results) => {
    setScanResults(results)
    setCurrentView('results')
  }

  const handleGoHome = () => {
    setCurrentView('home')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        hasResults={!!scanResults} 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'home' ? (
            <FileScanner onScanComplete={handleScanComplete} />
          ) : (
            <Dashboard scanResults={scanResults} onGoHome={handleGoHome} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
