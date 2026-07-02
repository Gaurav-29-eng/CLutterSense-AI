import { Home, FileText, Sparkles, BarChart3 } from 'lucide-react'

export default function Sidebar({ currentView, setCurrentView, hasResults }) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', alwaysShow: true },
    { id: 'results', icon: FileText, label: 'Results', showWhen: hasResults },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', showWhen: hasResults },
  ]

  return (
    <aside className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Sparkles className="h-8 w-8 text-primary-400" />
          <span className="ml-2 text-xl font-bold text-white">ClutterSense</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const shouldShow = item.alwaysShow || (item.showWhen && hasResults)
            
            if (!shouldShow) return null

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 w-64 p-6">
        <div className="bg-gradient-to-br from-primary-900/30 to-primary-800/20 rounded-xl p-4 border border-primary-700">
          <p className="text-sm text-gray-400 mb-2">AI-Powered</p>
          <p className="text-xs text-gray-500">Smart file analysis and recommendations</p>
        </div>
      </div>
    </aside>
  )
}
