import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export const AuthInput = ({ label, error, register, name, type = "text", required = true, ...props }: AuthInputProps) => (
  <div className="flex flex-col">
    <label className="text-[9px] font-bold uppercase text-gray-500 tracking-wide mb-0.5">
      {label} {!required && <span className="text-gray-400 font-normal normal-case">(Optional)</span>}
    </label>
    <input
      type={type}
      {...register(name)}
      {...props}
      className={`w-full px-2 py-[6px] text-sm bg-gray-50 text-gray-900 border rounded focus:ring-1 focus:ring-pink-500 focus:outline-none focus:bg-white transition ${
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
      }`}
    />
    {error && <span className="text-[9px] text-red-500 font-medium mt-0.5">{error.message}</span>}
  </div>
);