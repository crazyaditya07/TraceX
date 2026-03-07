import { motion } from 'framer-motion'
import { 
  Factory, 
  Truck, 
  PackageCheck, 
  ArrowRightLeft, 
  ShoppingCart,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react'

const stageIcons = {
  manufactured: Factory,
  shipped: Truck,
  received: PackageCheck,
  transferred: ArrowRightLeft,
  sold: ShoppingCart,
}

const stageColors = {
  manufactured: 'bg-blue-500',
  shipped: 'bg-purple-500',
  received: 'bg-orange-500',
  transferred: 'bg-cyan-500',
  sold: 'bg-green-500',
}

const Timeline = ({ stages, animated = true }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
      
      {/* Animated Progress Line */}
      {animated && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500"
        />
      )}

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const Icon = stageIcons[stage.stage] || PackageCheck
          const colorClass = stageColors[stage.stage] || 'bg-gray-500'
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: animated ? index * 0.2 : 0,
                ease: 'easeOut'
              }}
              className="relative flex items-start gap-4"
            >
              {/* Stage Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: animated ? index * 0.2 + 0.1 : 0,
                  type: 'spring',
                  stiffness: 200
                }}
                className={`relative z-10 w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
                
                {/* Verification Badge */}
                {stage.verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: animated ? index * 0.2 + 0.3 : 0.2 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Stage Content */}
              <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-white font-semibold capitalize mb-1">
                      {stage.stage}
                    </h4>
                    <p className="text-gray-400 text-sm mb-2">{stage.actor}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{stage.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(stage.timestamp)} at {formatTime(stage.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Verification */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs font-medium">Verified</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
