import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--bg-color)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
                `,
                opacity: 0.5
            }} />

            {/* Loading Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    textAlign: 'center'
                }}
            >
                {/* Logo */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--primary-color), #0ea5e9)',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        boxShadow: '0 10px 40px rgba(14, 165, 233, 0.2)'
                    }}
                >
                    <span style={{
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                    }}>
                        W
                    </span>
                </motion.div>

                {/* Loading Spinner */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{ marginBottom: '1rem' }}
                >
                    <Loader2 size={40} style={{ color: 'var(--primary-color)' }} />
                </motion.div>

                {/* Loading Text */}
                <div>
                    <h2 style={{
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        fontSize: '1.25rem'
                    }}>
                        Loading Wailand
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        maxWidth: '300px',
                        lineHeight: 1.5
                    }}>
                        Preparing your secure workspace...
                    </p>
                </div>

                {/* Progress Dots */}
                <motion.div
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '2rem'
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)'
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem'
            }}>
                Secure Project Management CRM
            </div>
        </div>
    );
}
