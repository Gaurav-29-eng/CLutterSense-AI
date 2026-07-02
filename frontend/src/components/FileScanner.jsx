import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Search, Loader2 } from 'lucide-react'
import axios from 'axios'

export default function FileScanner({ onScanComplete }) {
  const [folderPath, setFolderPath] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async () => {
    if (!folderPath.trim()) {
      setError('Please enter a folder path')
      return
    }

    setIsScanning(true)
    setError('')

    try {
      const payload = { folderPath }
      console.log('API Request:', {
        url: 'http://127.0.0.1:5000/api/scan',
        method: 'POST',
        body: payload
      })
      const response = await axios.post('http://127.0.0.1:5000/api/scan', payload)
      console.log('API Response:', response.data)
      onScanComplete(response.data)
    } catch (err) {
      console.error('API Error:', err)
      setError(err.response?.data?.error || 'Failed to scan folder')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full mb-4 shadow-lg shadow-primary-500/30">
            <FolderOpen className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Scan Your Folder</h2>
          <p className="text-gray-400">
            Enter a folder path to analyze files, detect duplicates, and get smart recommendations
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <label htmlFor="folderPath" className="block text-sm font-medium text-gray-300 mb-2">
              Folder Path
            </label>
            <input
              type="text"
              id="folderPath"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="e.g., C:\Users\YourName\Downloads"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white placeholder-gray-500 backdrop-blur-sm"
            />
          </motion.div>

          {error && (
            <motion.div
              className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-primary-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Start Scan
              </>
            )}
          </motion.button>
        </div>

        <motion.div
          className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">Tip:</strong> On Windows, use backslashes (\\) or forward slashes (/). 
            The scanner will analyze all files in the folder and subfolders.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
