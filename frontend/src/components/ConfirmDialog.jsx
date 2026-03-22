import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * ConfirmDialog — reusable styled confirmation modal
 * Props:
 *   open       : boolean
 *   title      : string
 *   message    : string
 *   confirmText: string  (default "Confirm")
 *   cancelText : string  (default "Cancel")
 *   danger     : boolean (red confirm button)
 *   onConfirm  : () => void
 *   onCancel   : () => void
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-ink-100"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Close */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 transition-colors"
            >
              <FiX />
            </button>

            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              danger ? 'bg-red-50 border border-red-200' : 'bg-gold-50 border border-gold-400'
            }`}>
              <FiAlertTriangle className={`text-xl ${danger ? 'text-red-500' : 'text-gold-600'}`} />
            </div>

            <h3 className="text-lg font-black text-ink-900 mb-2">{title}</h3>
            {message && <p className="text-sm text-ink-500 leading-relaxed mb-6">{message}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-ink-600 bg-ink-100 hover:bg-ink-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ${
                  danger
                    ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/25'
                    : 'bg-pitch-700 hover:bg-pitch-800 shadow-md shadow-pitch-700/25'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
