import { useState } from 'react'
import AudioProcessor from './components/AudioProcessor'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            YouTube Audio Processor
          </h1>
          <p className="text-gray-400">
            Extract, trim, and split audio from YouTube videos
          </p>
        </header>
        
        <AudioProcessor />
      </div>
    </div>
  )
}

export default App
