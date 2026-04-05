import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function EnhancedLogin() {
    const { login, loading, error, clearError } = useAuth();
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [showEmail, setShowEmail] = useState(false);
    const [loginStep, setLoginStep] = useState('code'); // 'code' or 'email'

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        
        const result = await login(code.trim(), email.trim() || null);
        
        if (result.success) {
            // Login successful - auth context will handle routing
        }
    };

    const handleCodeChange = (value) => {
        setCode(value);
        setShowEmail(value.length === 16 && value !== 'wailandadmin');
        
        // Auto-detect admin code
        if (value.toLowerCase() === 'wailandadmin') {
            setLoginStep('email');
        } else {
            setLoginStep('code');
        }
    };

    const isFormValid = () => {
        if (code.toLowerCase() === 'wailandadmin') {
            return email.trim().length > 0;
        }
        return code.trim().length === 16;
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                {/* Logo and Title */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, var(--primary-color), #0ea5e9)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        W
                    </div>
                    <h1 className="h1" style={{ marginBottom: '0.5rem' }}>
                        {code.toLowerCase() === 'wailandadmin' ? 'Admin Portal' : 'Project Access'}
                    </h1>
                    <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                        {code.toLowerCase() === 'wailandadmin' 
                            ? 'Enter your admin credentials to access the system control center.'
                            : 'Enter your secure Project Code to access your workspace.'
                        }
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    {/* Project Code Input */}
                    <div style={{ textAlign: 'left' }}>
                        <label className="text-sm" style={{ 
                            fontWeight: 500, 
                            marginBottom: '0.5rem', 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {code.toLowerCase() === 'wailandadmin' ? (
                                <Shield size={16} style={{ color: 'var(--warning-color)' }} />
                            ) : (
                                <Lock size={16} style={{ color: 'var(--primary-color)' }} />
                            )}
                            Project Code
                        </label>
                        <input 
                            type="text" 
                            placeholder={code.toLowerCase() === 'wailandadmin' ? 'wailandadmin' : 'e.g. XyZ123!@#'}
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            required
                            autoComplete="off"
                            style={{
                                fontFamily: code.toLowerCase() === 'wailandadmin' ? 'monospace' : 'inherit',
                                fontSize: code.toLowerCase() === 'wailandadmin' ? '16px' : 'inherit'
                            }}
                        />
                        {code.toLowerCase() === 'wailandadmin' && (
                            <div className="text-xs" style={{ 
                                marginTop: '0.5rem', 
                                color: 'var(--warning-color)',
                                textAlign: 'center'
                            }}>
                                ⚠️ Admin access detected - email verification required
                            </div>
                        )}
                    </div>

                    {/* Email Input (for admin or enhanced project access) */}
                    {(showEmail || code.toLowerCase() === 'wailandadmin') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            style={{ textAlign: 'left' }}
                        >
                            <label className="text-sm" style={{ 
                                fontWeight: 500, 
                                marginBottom: '0.5rem', 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Mail size={16} style={{ color: 'var(--primary-color)' }} />
                                Email Address {code.toLowerCase() === 'wailandadmin' ? '(Required)' : '(Optional)'}
                            </label>
                            <input 
                                type="email" 
                                placeholder={code.toLowerCase() === 'wailandadmin' ? 'admin@wailand.com' : 'your@email.com'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required={code.toLowerCase() === 'wailandadmin'}
                                autoComplete="email"
                            />
                            {code.toLowerCase() !== 'wailandadmin' && (
                                <div className="text-xs" style={{ 
                                    marginTop: '0.5rem', 
                                    color: 'var(--text-secondary)',
                                    fontStyle: 'italic'
                                }}>
                                    💡 Add your email to save your progress and get updates
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                                style={{ 
                                    color: 'var(--danger-color)', 
                                    fontSize: '0.875rem', 
                                    textAlign: 'left', 
                                    padding: '0.75rem', 
                                    background: '#fee2e2', 
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid #fecaca'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ 
                            width: '100%', 
                            marginTop: '1rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }} 
                        disabled={loading || !isFormValid()}
                    >
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid white',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Authenticating...
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {code.toLowerCase() === 'wailandadmin' ? (
                                    <Shield size={18} />
                                ) : (
                                    <User size={18} />
                                )}
                                Enter Workspace
                            </motion.div>
                        )}
                    </button>
                </form>

                {/* Help Section */}
                <div style={{ 
                    marginTop: '2rem', 
                    padding: '1rem', 
                    background: '#f8fafc', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Need Help?
                    </div>
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {code.toLowerCase() === 'wailandadmin' ? (
                            <>
                                • Contact your system administrator<br/>
                                • Check your admin credentials<br/>
                                • Use the admin code provided during setup
                            </>
                        ) : (
                            <>
                                • Your Project Code is 16 characters long<br/>
                                • Check your email for the access code<br/>
                                • Contact your project manager if you need access
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
