import { HardDrive } from 'lucide-react'

export default function StorageBar({ totalSize, duplicateSize, junkSize }) {
  const driveCapacity = 1 * 1024 * 1024 * 1024 * 1024 // 1TB baseline
  const usedPercentage = (totalSize / driveCapacity) * 100
  const duplicatePercentage = (duplicateSize / totalSize) * 100 || 0
  const junkPercentage = (junkSize / totalSize) * 100 || 0
  const cleanPercentage = 100 - duplicatePercentage - junkPercentage

  const getColorClass = (percentage) => {
    if (percentage > 80) return 'bg-red-500'
    if (percentage > 60) return 'bg-orange-500'
    if (percentage > 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <HardDrive className="h-5 w-5 text-primary-400 mr-2" />
          <span className="text-white font-semibold">Storage Usage</span>
        </div>
        <span className={`text-sm font-bold ${getColorClass(usedPercentage)}`}>
          {usedPercentage.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out ${getColorClass(usedPercentage)}`}
          style={{ width: `${usedPercentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="w-full h-2 bg-green-500/30 rounded-full mb-2">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${cleanPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Clean</p>
          <p className="text-sm font-semibold text-white">{cleanPercentage.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <div className="w-full h-2 bg-orange-500/30 rounded-full mb-2">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${duplicatePercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Duplicates</p>
          <p className="text-sm font-semibold text-white">{duplicatePercentage.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <div className="w-full h-2 bg-purple-500/30 rounded-full mb-2">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${junkPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Junk</p>
          <p className="text-sm font-semibold text-white">{junkPercentage.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}
