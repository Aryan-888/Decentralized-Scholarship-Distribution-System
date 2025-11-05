"use client";
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Shield, Wallet, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const { user, loading: authLoading, initialized } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        if (initialized && user) {
            router.push('/');
        }
        
        // Check for success message from registration
        const message = searchParams.get('message');
        if (message) {
            setSuccessMessage(message);
            // Clear the URL parameter after showing the message
            router.replace('/login');
        }
    }, [user, initialized, router, searchParams]);

    const onSubmit = async (e) => {
        e.preventDefault()
        // Clear any existing messages
        setErrorMessage('')
        setSuccessMessage('')
        
        // Client-side validation
        if (!email.trim()) {
            setErrorMessage('Please enter your email address.')
            return
        }
        
        if (!password.trim()) {
            setErrorMessage('Please enter your password.')
            return
        }
        
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setErrorMessage('Please enter a valid email address.')
            return
        }
        
        if(!isSigningIn) {
            setIsSigningIn(true)
            try {
                await signInWithEmailAndPassword(auth, email, password)
                toast.success('Logged in successfully!')
                // Login successful - redirect will happen via useAuth
            } catch (error) {
                console.error('Login error:', error)
                // Handle specific Firebase auth errors
                if (error.code === 'auth/invalid-credential') {
                    setErrorMessage('Invalid email or password. Please check your credentials and try again.')
                } else if (error.code === 'auth/user-not-found') {
                    setErrorMessage('No account found with this email. Please check your email or create a new account.')
                } else if (error.code === 'auth/wrong-password') {
                    setErrorMessage('Incorrect password. Please try again.')
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMessage('Please enter a valid email address.')
                } else if (error.code === 'auth/user-disabled') {
                    setErrorMessage('This account has been disabled. Please contact support.')
                } else if (error.code === 'auth/too-many-requests') {
                    setErrorMessage('Too many failed login attempts. Please try again later.')
                } else {
                    setErrorMessage('Login failed. Please try again.')
                }
                toast.error('Login failed')
            } finally {
                setIsSigningIn(false)
            }
        }
    }

    const onGoogleSignIn = async (e) => {
        e.preventDefault()
        // Clear any existing messages
        setErrorMessage('')
        setSuccessMessage('')
        
        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                toast.success('Logged in with Google successfully!')
                // Login successful - redirect will happen via useAuth
            } catch (error) {
                console.error('Google sign-in error:', error)
                setErrorMessage('Google sign-in failed. Please try again.')
                toast.error('Google sign-in failed')
            } finally {
                setIsSigningIn(false)
            }
        }
    }

    // Show loading while auth is initializing
    if (!initialized || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
            </div>
            
            <main className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">Sign in to your account to continue</p>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        autoComplete='email'
                                        required
                                        value={email} 
                                        onChange={(e) => { setEmail(e.target.value) }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your email"
                                        suppressHydrationWarning
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        autoComplete='current-password'
                                        required
                                        value={password} 
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your password"
                                        suppressHydrationWarning
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <span className='text-green-700 font-medium flex items-center'>
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {successMessage}
                                </span>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <span className='text-red-700 font-medium flex items-center'>
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {errorMessage}
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 transform ${
                                isSigningIn 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                            suppressHydrationWarning
                        >
                            {isSigningIn ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                    <div className="text-center">
                        <p className="text-gray-600">Don't have an account? <Link href={'/register'} className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-200">Sign up</Link></p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                        </div>
                    </div>
                    
                    <button
                        disabled={isSigningIn}
                        onClick={(e) => { onGoogleSignIn(e) }}
                        className={`w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-700 transition-all duration-200 ${
                            isSigningIn 
                                ? 'cursor-not-allowed opacity-50' 
                                : 'hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        suppressHydrationWarning
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_17_40)">
                                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                            </g>
                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="48" height="48" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        {isSigningIn ? 'Signing In...' : 'Continue with Google'}
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Login