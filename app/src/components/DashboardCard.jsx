import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend = null, 
  trendValue = null,
  color = 'indigo',
  delay = 0 
}) => {
  const colorVariants = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20',
  }

  const iconColors = {
    indigo: 'text-indigo-400 bg-indigo-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20',
    green: 'text-green-400 bg-green-500/20',
    orange: 'text-orange-400 bg-orange-500/20',
    pink: 'text-pink-400 bg-pink-500/20',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorVariants[color]} p-6`}
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${iconColors[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {value}
        </motion.div>
        
        {subtitle && (
          <p className="text-gray-500 text-sm">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

export default DashboardCard
