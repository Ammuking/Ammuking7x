import React, { useState } from 'react';
import { SparklesIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (emailOrPhone: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrPhone.trim()) {
      setIsSendingOtp(true);
      // Simulate sending OTP via email/SMS
      setTimeout(() => {
        setIsSendingOtp(false);
        setStep(2);
      }, 1500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For the demo, we accept a hardcoded OTP
    if (otp === '123456') {
      onLogin(emailOrPhone);
    } else {
      alert("Invalid OTP. Please use 123456 for this demo.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter">A.K ai</h1>
        <p className="text-gray-400 mt-2">Your creative co-pilot</p>
      </div>

      <div className="w-full max-w-sm">
        {step === 1 && (
          <form onSubmit={handleContinue} className="space-y-6">
            <h2 className="text-xl font-semibold text-center">Sign In or Create Account</h2>
            <div>
              <label htmlFor="emailOrPhone" className="sr-only">Email or Phone</label>
              <input
                id="emailOrPhone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email or Phone Number"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                required
                disabled={isSendingOtp}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 flex items-center justify-center disabled:bg-gray-600 disabled:scale-100 disabled:cursor-wait"
              disabled={isSendingOtp || !emailOrPhone.trim()}
            >
              {isSendingOtp ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleLogin} className="space-y-6">
            <h2 className="text-xl font-semibold text-center">Enter Verification Code</h2>
            <p className="text-center text-gray-400 text-sm leading-relaxed">
              An OTP has been sent to {emailOrPhone}.<br/>
              For this demo, please use the code: <span className="font-bold text-white tracking-wider">123456</span>
            </p>
            <div>
              <label htmlFor="otp" className="sr-only">OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-center tracking-[0.5em] focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Verify & Sign In
            </button>
            <button onClick={() => setStep(1)} className="w-full text-center text-gray-400 hover:text-white mt-4">
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}