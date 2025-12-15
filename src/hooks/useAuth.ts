import { useMutation } from '@tanstack/react-query';
import { LoginFormData, SignupFormData } from '../lib/schemas'; // standardized import

// MOCK API FUNCTION
const mockLoginRequest = async (data: LoginFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log("API LOGIN SENT:", data);
  return { success: true, token: "fake-jwt-token" };
};

// MOCK API FUNCTION
const mockSignupRequest = async (data: SignupFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log("API SIGNUP SENT:", data);
  return { success: true };
};

export const useLogin = () => {
  return useMutation({
    mutationFn: mockLoginRequest,
    onSuccess: () => alert("Login Successful!"),
    onError: () => alert("Login Failed"),
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: mockSignupRequest,
    onSuccess: () => alert("Account Created! Please Log in."),
  });
};