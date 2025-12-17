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
  <div className="flex flex-col gap-0.5">
    <div className="flex justify-between">
      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wide">
        {label} {!required && <span className="text-gray-400 font-normal normal-case">(Optional)</span>}
      </label>
    </div>
    <input
      type={type}
      {...register(name)}
      {...props}
      className={`w-full p-2 text-sm bg-gray-50 border rounded-md focus:ring-1 focus:ring-pink-500 focus:outline-none transition ${
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
      }`}
    />
    {error && <span className="text-[10px] text-red-500 font-medium">{error.message}</span>}
  </div>
);