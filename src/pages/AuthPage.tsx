import { Monitor, Cpu, HardDrive } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuthPage } from '../hooks/useAuthPage';

export default function AuthPage() {
  const {
    view,
    toggleView,
    isSubmitting,
    error,
    successMessage,
    handleLogin,
    handleRegister,
  } = useAuthPage();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex items-center justify-center p-4 md:p-8">
      {/* Main Container: Glassmorphism Card */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Left Side: Creative Mint Glass */}
        <div className="hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-12 bg-emerald-500/10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-teal-200/40 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex gap-6 mb-8">
            <div className="animate-bounce-slow bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm text-emerald-800">
              <Monitor className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <div className="animate-bounce-slow delay-200 bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm text-emerald-800">
              <Cpu className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <div className="animate-bounce-slow delay-500 bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm text-emerald-800">
              <HardDrive className="w-12 h-12" strokeWidth={1.5} />
            </div>
          </div>
          
          <h2 className="relative z-10 text-4xl font-bold text-emerald-900 tracking-tight">
            E-Track
          </h2>
          <p className="relative z-10 text-emerald-700/70 mt-2 font-medium">Smart Waste Inventory & Management</p>
        </div>

        {/* Right Side: Forms */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white/80">
          <div className="absolute top-8 right-8 text-sm">
            <button 
              onClick={toggleView} 
              className="text-emerald-700 font-semibold hover:text-emerald-500 transition-colors"
            >
              {view === 'login' ? 'Create a new Account' : 'Log in instead'}
            </button>
          </div>

          <div className="w-full max-w-sm">
            {/* Inline Success Message Display */}
            {successMessage && (
              <div className="mb-6 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-in fade-in duration-300">
                {successMessage}
              </div>
            )}

            {view === 'login' ? (
              <LoginForm 
                onSubmit={handleLogin} 
                isSubmitting={isSubmitting} 
                error={error} 
              />
            ) : (
              <RegisterForm 
                onSubmit={handleRegister} 
                isSubmitting={isSubmitting} 
                error={error} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}