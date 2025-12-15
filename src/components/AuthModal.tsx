import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';

// Relative imports to ensure files are found
import { useAuthStore } from '../store/useAuthStore';
import { useLogin, useSignup } from '../hooks/useAuth';
import {
  loginSchema, signupSchema,
  LoginFormData, SignupFormData,
  ROLE_OPTIONS
} from '@/src/lib/schema';

// Helper for cleaner inputs - COMPACT VERSION
const Input = ({ label, error, register, name, type = "text", ...props }: any) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wide">{label}</label>
    <input
      type={type}
      {...register(name)}
      {...props}
      // Reduced padding (p-1.5) and font size (text-sm)
      className={`w-full p-1.5 text-sm bg-gray-50 border rounded-md focus:ring-1 focus:ring-pink-500 focus:outline-none transition ${
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
      }`}
    />
    {error && <span className="text-[10px] text-red-500 font-medium">{error.message}</span>}
  </div>
);

export default function AuthModal() {
  const { isOpen, view, close, toggleView } = useAuthStore();
  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const formLogin = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const formSignup = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  // Reset forms on close
  useEffect(() => {
    if (!isOpen) {
      formLogin.reset();
      formSignup.reset();
    }
  }, [isOpen, formLogin, formSignup]);

  const onLogin: SubmitHandler<LoginFormData> = (data) => loginMutation.mutate(data);
  const onSignup: SubmitHandler<SignupFormData> = (data) => signupMutation.mutate(data);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* Header - Reduced padding and font size */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={close} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Body - Reduced padding and spacing */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {view === 'login' ? (
            // LOGIN FORM - Tighter spacing (space-y-3)
            <form onSubmit={formLogin.handleSubmit(onLogin)} className="space-y-3">
              <Input label="Email" name="email" type="email" register={formLogin.register} error={formLogin.formState.errors.email} />
              <Input label="Password" name="password" type="password" register={formLogin.register} error={formLogin.formState.errors.password} />

              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wide">Role</label>
                <select {...formLogin.register("role")} className="w-full p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md">
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Compact Button */}
              <button type="submit" disabled={loginMutation.isPending} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-md text-sm font-bold transition flex justify-center items-center gap-2 mt-2">
                {loginMutation.isPending && <Loader2 className="animate-spin" size={16} />} Log In
              </button>
            </form>
          ) : (
            // SIGNUP FORM - Tighter spacing (space-y-2) and grids (gap-2)
            <form onSubmit={formSignup.handleSubmit(onSignup)} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input label="First Name" name="first_name" register={formSignup.register} error={formSignup.formState.errors.first_name} />
                <Input label="Last Name" name="last_name" register={formSignup.register} error={formSignup.formState.errors.last_name} />
              </div>

              <Input label="Email" name="email" type="email" register={formSignup.register} error={formSignup.formState.errors.email} />
              <Input label="Phone" name="phone_number" type="tel" register={formSignup.register} error={formSignup.formState.errors.phone_number} />
              <Input label="Password" name="password" type="password" register={formSignup.register} error={formSignup.formState.errors.password} />

              <div className="grid grid-cols-2 gap-2">
                 <Input label="Date of Birth" name="date_of_birth" type="date" register={formSignup.register} error={formSignup.formState.errors.date_of_birth} />
                 <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wide">Role</label>
                    <select {...formSignup.register("role")} className="w-full p-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md">
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
              </div>

              {/* Optional Details Box - Tighter padding and spacing */}
              <div className="p-2 bg-gray-50 rounded-md space-y-2 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Optional Details</p>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Company" name="company_name" register={formSignup.register} error={formSignup.formState.errors.company_name} />
                    <Input label="Venue" name="venue_name" register={formSignup.register} error={formSignup.formState.errors.venue_name} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Postal" name="postal" register={formSignup.register} error={formSignup.formState.errors.postal} />
                    <Input label="Country" name="country" register={formSignup.register} error={formSignup.formState.errors.country} />
                </div>
                <Input label="Social Link" name="social_link" register={formSignup.register} error={formSignup.formState.errors.social_link} />
              </div>

              {/* Compact Button */}
              <button type="submit" disabled={signupMutation.isPending} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-md text-sm font-bold transition flex justify-center items-center gap-2">
                {signupMutation.isPending && <Loader2 className="animate-spin" size={16} />} Create Account
              </button>
            </form>
          )}
        </div>

        {/* Footer - Reduced padding and font size */}
        <div className="p-3 bg-gray-50 border-t text-center text-xs">
          {view === 'login' ? (
             <p>Don't have an account? <span onClick={toggleView} className="text-pink-600 font-bold cursor-pointer hover:underline">Sign Up</span></p>
          ) : (
             <p>Already have an account? <span onClick={toggleView} className="text-pink-600 font-bold cursor-pointer hover:underline">Log In</span></p>
          )}
        </div>
      </div>
    </div>
  );
}