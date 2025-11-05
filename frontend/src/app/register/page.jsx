"use client";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
    const { user, loading: authLoading, initialized } = useAuth();
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (initialized && user) {
            router.push('/');
        }
    }, [user, initialized, router]);

    const onSubmit = async (e) => {
        e.preventDefault()
        
        // Reset error message
        setErrorMessage('')
        
        // Client-side validation
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match')
            return
        }
        
        if (password.length < 6) {
            setErrorMessage('Password should be at least 6 characters')
            return
        }
        
        if(!isRegistering) {
            setIsRegistering(true)
            try {
                await createUserWithEmailAndPassword(auth, email, password)
                // Registration successful
                toast.success('Registration successful! Please log in.')
                setErrorMessage('')
                router.push('/login?message=Registration successful! Please log in.')
            } catch (error) {
                console.error('Registration error:', error)
                // Handle specific Firebase auth errors
                if (error.code === 'auth/weak-password') {
                    setErrorMessage('Password should be at least 6 characters')
                } else if (error.code === 'auth/email-already-in-use') {
                    setErrorMessage('Email is already registered')
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMessage('Please enter a valid email address')
                } else {
                    setErrorMessage(error.message || 'Registration failed. Please try again.')
                }
                toast.error('Registration failed')
            } finally {
                setIsRegistering(false)
            }
        }
    }

    // Show loading while auth is initializing
    if (!initialized || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
            </div>
            
            <main className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Create Account
                        </h1>
                        <p className="text-gray-600">Join us and start your journey</p>
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
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your email"
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
                                        disabled={isRegistering}
                                        type="password"
                                        autoComplete='new-password'
                                        required
                                        value={password} 
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Create a password"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Password must be at least 6 characters long
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        disabled={isRegistering}
                                        type="password"
                                        autoComplete='off'
                                        required
                                        value={confirmPassword} 
                                        onChange={(e) => { setconfirmPassword(e.target.value) }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Confirm your password"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                {confirmPassword && (
                                    <p className={`text-xs mt-2 flex items-center font-medium ${
                                        password === confirmPassword ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {password === confirmPassword ? (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Passwords match
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Passwords do not match
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

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
                            disabled={isRegistering}
                            className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 transform ${
                                isRegistering 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-linear-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {isRegistering ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>
                    
                    <div className="text-center">
                        <p className="text-gray-600">Already have an account? <Link href={'/login'} className="font-semibold text-purple-600 hover:text-blue-600 transition-colors duration-200">Sign in</Link></p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Register