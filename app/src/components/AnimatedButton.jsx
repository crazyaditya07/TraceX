import { motion } from 'framer-motion'

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  icon: Icon = null,
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25',
    secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
    outline: 'bg-transparent text-white border border-white/20 hover:bg-white/5',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    success: 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2 
        rounded-xl font-medium transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        />
      )}
      
      {!loading && Icon && <Icon className="w-4 h-4" />}
      
      <span>{children}</span>
      
      {/* Shine Effect */}
      {!disabled && !loading && variant === 'primary' && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 0.3 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
        />
      )}
    </motion.button>
  )
}

export default AnimatedButton
