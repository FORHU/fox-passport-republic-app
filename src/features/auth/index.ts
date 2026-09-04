// Components
export { default as AuthModal } from "./components/AuthModal";
export { default as LoginForm } from "./components/LoginForm";
export { default as SignupForm } from "./components/SignupForm";
export { default as ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { default as ResetPasswordForm } from "./components/ResetPasswordForm";
export { default as VerifyEmailForm } from "./components/VerifyEmailForm";
export { default as RequireAuth } from "@/shared/auth/RequireAuth";

// Store & Hooks
export { useAuthStore } from "@/shared/auth/useAuthStore";
export {
  useLogin,
  useSignup,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useResendOtp,
  useLogout,
} from "./hooks/useAuth";
export { useRoleAccess } from "./hooks/useRoleAccess";
export { useSessionManager } from "@/shared/auth/useSessionManager";
export { useUserMenu } from "./hooks/useUserMenu";

// Types
export * from "@/shared/auth/types";
