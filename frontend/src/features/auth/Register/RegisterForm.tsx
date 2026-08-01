"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  type RegisterInput,
  registerSchema,
} from "@/src/lib/validations/auth.schema";

import {
  AppLink,
  Divider,
  PasswordField,
  SocialButton,
  SubmitButton,
  TextField,
} from "@/src/components/ui";

import { useRegister } from "@/src/client/auth";

export default function RegisterForm() {
  const router = useRouter();

  const { mutateAsync: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const handleRegister = async (data: RegisterInput) => {
    try {
      const response = await registerUser(data);
      router.replace(
        `/check-your-email?email=${encodeURIComponent(response.data.email)}`,
      );
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
      {/* Name */}
      <TextField
        id="name"
        label="Full Name"
        placeholder="Enter your full name"
        leftIcon={<User className="w-4 h-4 text-gray-400" />}
        registration={register("name")}
        error={errors.name}
      />

      {/* Email */}
      <TextField
        id="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
        registration={register("email")}
        error={errors.email}
      />

      {/* Password */}
      <PasswordField
        id="password"
        label="Password"
        placeholder="Create a password"
        registration={register("password")}
        error={errors.password}
      />

      {/* Confirm Password */}
      <PasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        registration={register("confirmPassword")}
        error={errors.confirmPassword}
      />

      {/* Submit */}
      <SubmitButton
        className="w-full flex items-center justify-center gap-2"
        isSubmitting={isPending}
        isValid={isValid}
      >
        Create Account
      </SubmitButton>

      {/* Login link */}
      <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <AppLink
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          Sign In
        </AppLink>
      </p>

      {/* Divider */}
      <Divider text="Or With" />

      {/* Social Login */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <SocialButton provider="google" />
        <SocialButton provider="apple" />
      </div>
    </form>
  );
}
