import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Search, Loader2, FileText, X } from 'lucide-react'
import axios from 'axios'

export default function FileScanner({ onScanComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const folderInputRef = useRef(null)

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files)
    console.log('Selected files:', files.length, files)
    setSelectedFiles(prev => [...prev, ...files])
    setError('')
  }

  const handleBrowseClick = () => {
    folderInputRef.current?.click()
  }

  const traverseFileTree = async (item, path = '') => {
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file) => {
          file.fullPath = path + file.name
          resolve(file)
        })
      })
    } else if (item.isDirectory) {
      const dirReader = item.createReader()
      const entries = await new Promise((resolve) => {
        dirReader.readEntries((entries) => resolve(entries))
      })
      const files = []
      for (const entry of entries) {
        const childFiles = await traverseFileTree(entry, path + item.name + '/')
        files.push(...childFiles)
      }
      return files
    }
    return []
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const items = Array.from(e.dataTransfer.items)
    const files = []
    
    for (const item of items) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          if (entry.isFile) {
            const file = await new Promise((resolve) => {
              entry.file((f) => resolve(f))
            })
            files.push(file)
          } else if (entry.isDirectory) {
            const folderFiles = await traverseFileTree(entry)
            files.push(...folderFiles)
          }
        }
      } else {
        // Fallback for browsers without webkitGetAsEntry
        const file = item.getAsFile()
        if (file) {
          files.push(file)
        }
      }
    }
    
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
      setError('')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleScan = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file')
      return
    }

    setIsScanning(true)
    setError('')

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      console.log('API Request:', {
        url: 'http://localhost:5000/api/scan',
        method: 'POST',
        filesCount: selectedFiles.length
      })

      const response = await axios.post('http://localhost:5000/api/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('API Response:', response.data)
      onScanComplete(response.data)
    } catch (err) {
      console.error('API Error:', err)
      setError(err.response?.data?.error || 'Failed to analyze files')
    } finally {
      setIsScanning(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
            <Upload className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Upload Folders</h2>
          <p className="text-gray-400">
            Upload folders to analyze duplicates, large files, and get smart recommendations
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-2">
                Drag and drop folders here, or{' '}
                <button onClick={handleBrowseClick} className="text-primary-400 hover:text-primary-300 cursor-pointer underline bg-transparent border-none p-0">
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supports folder upload with all files inside (Max 500MB per file)
              </p>
              <input
                ref={folderInputRef}
                type="file"
                multiple
                onChange={handleFolderSelect}
                style={{ display: "none" }}
                {...{ webkitdirectory: "", directory: "" }}
              />
            </div>
          </motion.div>

          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">
                  Selected Files ({selectedFiles.length})
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-300 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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
            disabled={isScanning || selectedFiles.length === 0}
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
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Analyze Files
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
            <strong className="text-gray-300">Tip:</strong> Upload entire folders to detect duplicates across all files. 
            Files are analyzed on the server and automatically deleted after analysis.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
