import { motion } from 'framer-motion'
import { FileText, Copy, AlertTriangle, Trash2, HardDrive, Folder, ArrowLeft, Sparkles, Bot } from 'lucide-react'
import StorageBar from './StorageBar'
import CategoryChart from './CategoryChart'
import axios from 'axios'
import { useState, useEffect } from 'react'

export default function Dashboard({ scanResults, onGoHome }) {
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [loadingAi, setLoadingAi] = useState(false)
  const [useAi, setUseAi] = useState(true)

  useEffect(() => {
    if (scanResults && useAi) {
      fetchAiRecommendations()
    } else if (scanResults && !useAi) {
      // Use rule-based recommendations from scan results
      setAiRecommendations(scanResults.recommendations || [])
    }
  }, [scanResults, useAi])

  const fetchAiRecommendations = async () => {
    setLoadingAi(true)
    try {
      const payload = { scanResults }
      console.log('Recommendations API Request:', {
        url: 'https://cluttersense-ai.onrender.com/api/recommendations',
        method: 'POST',
        body: payload
      })
      const response = await axios.post('https://cluttersense-ai.onrender.com/api/recommendations', payload)
      console.log('Recommendations API Response:', response.data)
      setAiRecommendations(response.data.recommendations)
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error)
      // Fall back to rule-based recommendations
      setAiRecommendations(scanResults.recommendations || [])
    } finally {
      setLoadingAi(false)
    }
  }

  if (!scanResults) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-6">
          <Folder className="h-12 w-12 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Scan Results</h3>
        <p className="text-gray-400 mb-6">
          Scan a folder to see file analysis, duplicates, and recommendations
        </p>
        <button
          onClick={onGoHome}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Go to Home
        </button>
      </div>
    )
  }

  const { summary, duplicates, largeFiles, junkFiles, recommendations } = scanResults

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back button */}
      <motion.button
        onClick={onGoHome}
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        whileHover={{ x: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Home
      </motion.button>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          title="Total Files"
          value={summary.totalFiles}
          color="blue"
        />
        <StatCard
          icon={<HardDrive className="h-6 w-6" />}
          title="Storage Used"
          value={formatBytes(summary.totalSize)}
          color="green"
        />
        <StatCard
          icon={<Copy className="h-6 w-6" />}
          title="Duplicates"
          value={summary.duplicateCount}
          color="orange"
        />
        <StatCard
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Large Files"
          value={summary.largeFileCount}
          color="red"
        />
        <StatCard
          icon={<Trash2 className="h-6 w-6" />}
          title="Junk Files"
          value={summary.junkFileCount}
          color="purple"
        />
      </motion.div>

      {/* Storage Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StorageBar 
          totalSize={summary.totalSize}
          duplicateSize={summary.duplicateSize}
          junkSize={summary.junkSize}
        />
      </motion.div>

      {/* Category Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CategoryChart categories={summary.categories} />
      </motion.div>

      {/* Duplicates */}
      {duplicates.length > 0 && (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Copy className="h-5 w-5 mr-2 text-orange-400" />
            Duplicate Files ({duplicates.length} groups)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {duplicates.slice(0, 10).map((dup, index) => (
              <div key={index} className="bg-orange-900/20 rounded-lg p-4 border border-orange-700">
                <p className="font-medium text-white">{dup.hash}</p>
                <p className="text-sm text-gray-400">{dup.files.length} copies</p>
                <p className="text-sm text-orange-400">{formatBytes(dup.size)} wasted</p>
              </div>
            ))}
            {duplicates.length > 10 && (
              <p className="text-sm text-gray-500 text-center">And {duplicates.length - 10} more...</p>
            )}
          </div>
        </div>
      )}

      {/* Large Files */}
      {largeFiles.length > 0 && (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
            Large Files (&gt;100MB)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {largeFiles.slice(0, 10).map((file, index) => (
              <div key={index} className="bg-red-900/20 rounded-lg p-4 border border-red-700">
                <p className="font-medium text-white truncate">{file.path}</p>
                <p className="text-sm text-red-400">{formatBytes(file.size)}</p>
              </div>
            ))}
            {largeFiles.length > 10 && (
              <p className="text-sm text-gray-500 text-center">And {largeFiles.length - 10} more...</p>
            )}
          </div>
        </div>
      )}

      {/* Junk Files */}
      {junkFiles.length > 0 && (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-purple-400" />
            Junk/Temp Files ({junkFiles.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {junkFiles.slice(0, 10).map((file, index) => (
              <div key={index} className="bg-purple-900/20 rounded-lg p-4 border border-purple-700">
                <p className="font-medium text-white truncate">{file.path}</p>
                <p className="text-sm text-purple-400">{formatBytes(file.size)}</p>
              </div>
            ))}
            {junkFiles.length > 10 && (
              <p className="text-sm text-gray-500 text-center">And {junkFiles.length - 10} more...</p>
            )}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-primary-900/50 to-primary-800/30 rounded-2xl shadow-2xl p-6 border border-primary-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                {useAi ? (
                  <Bot className="h-5 w-5 mr-2 text-primary-400" />
                ) : (
                  <Sparkles className="h-5 w-5 mr-2 text-primary-400" />
                )}
                {useAi ? 'AI-Powered Recommendations' : 'Smart Recommendations'}
              </h3>
              <button
                onClick={() => setUseAi(!useAi)}
                className="text-xs px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                {useAi ? 'Switch to Rule-Based' : 'Switch to AI'}
              </button>
            </div>
            {loadingAi ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                <span className="ml-3 text-gray-400">Generating AI recommendations...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                  >
                    <p className="text-gray-200">{rec}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-900/30 text-blue-400 border-blue-700',
    green: 'bg-green-900/30 text-green-400 border-green-700',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-700',
    red: 'bg-red-900/30 text-red-400 border-red-700',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-700',
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </motion.div>
  )
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
