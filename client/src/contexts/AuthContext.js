import { createContext, useContext, useReducer, useEffect } from 'react';

// Auth context for managing user state and tokens
const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                role: action.payload.role,
                project: action.payload.project,
                error: null
            };
        
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                role: null,
                project: null,
                error: action.payload
            };
        
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                role: null,
                project: null,
                error: null
            };
        
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };
        
        case 'UPDATE_PROJECT':
            return {
                ...state,
                project: { ...state.project, ...action.payload }
            };
        
        default:
            return state;
    }
};

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
    project: null,
    loading: false,
    error: null
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('wailand_auth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: authData
                });
            } catch (error) {
                console.error('Failed to parse stored auth data:', error);
                localStorage.removeItem('wailand_auth');
            }
        }
    }, []);

    // Save auth state to localStorage whenever it changes
    useEffect(() => {
        if (state.isAuthenticated && state.token) {
            localStorage.setItem('wailand_auth', JSON.stringify({
                user: state.user,
                token: state.token,
                role: state.role,
                project: state.project
            }));
        } else {
            localStorage.removeItem('wailand_auth');
        }
    }, [state]);

    // Login function
    const login = async (code, email = null) => {
        dispatch({ type: 'LOGIN_START' });
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, email })
            });

            const data = await response.json();

            if (!response.ok) {
                dispatch({
                    type: 'LOGIN_FAILURE',
                    payload: data.message || 'Login failed'
                });
                return { success: false, data };
            }

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data
            });

            return { success: true, data };
        } catch (error) {
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: 'Network error. Please try again.'
            });
            return { success: false, error: 'Network error' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            if (state.token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${state.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    // Update user function
    const updateUser = (userData) => {
        dispatch({
            type: 'UPDATE_USER',
            payload: userData
        });
    };

    // Update project function
    const updateProject = (projectData) => {
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: projectData
        });
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        logout,
        updateUser,
        updateProject,
        clearError,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        role: state.role,
        project: state.project,
        loading: state.loading,
        error: state.error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
