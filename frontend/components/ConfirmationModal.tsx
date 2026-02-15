import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isProcessing?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isProcessing = false,
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            button: 'bg-red-600 hover:bg-red-500',
        },
        warning: {
            icon: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            button: 'bg-yellow-600 hover:bg-yellow-500',
        },
        info: {
            icon: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            button: 'bg-blue-600 hover:bg-blue-500',
        }
    };

    const theme = colors[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${theme.bg} ${theme.border} border-2 mb-2`}>
                        <AlertTriangle className={theme.icon} size={32} />
                    </div>

                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                        {title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full mt-4">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-3 px-6 rounded-xl bg-zinc-800 text-white font-bold uppercase tracking-wider text-xs hover:bg-zinc-700 transition-colors border border-white/5"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`flex-1 py-3 px-6 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 ${theme.button}`}
                        >
                            {isProcessing && <Loader2 className="animate-spin" size={14} />}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
