"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  loginSchema,
  type LoginInput,
} from "@/src/lib/validations/auth.schema";
import {
  AppLink,
  Checkbox,
  Divider,
  PasswordField,
  SocialButton,
  SubmitButton,
  TextField,
} from "@/src/components/ui";
import { useRouter } from "next/navigation";
import { useLogin } from "@/src/client/auth";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onTouched",
  });

  const handleLogin = async (data: LoginInput) => {
    try {
      const response = await login(data);

      if (response.data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
      {/* Email field */}
      <TextField
        id="email"
        label={t("emailLabel")}
        type="email"
        placeholder={t("emailPlaceholder")}
        leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
        registration={register("email")}
        error={errors.email}
      />

      {/* Password field */}
      <PasswordField
        id="password"
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        registration={register("password")}
        error={errors.password}
      />

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <Checkbox label={t("rememberMe")} registration={register("remember")} />

        <AppLink
          href="/forgot-password"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          {t("forgotPassword")}
        </AppLink>
      </div>

      {/* Sign in button */}
      <SubmitButton
        className="w-full flex items-center justify-center gap-2"
        isSubmitting={isPending}
        isValid={isValid}
      >
        {t("signIn")}
      </SubmitButton>

      {/* Sign up link */}
      <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
        {t("noAccount")}{" "}
        <AppLink
          href="/register"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {t("signUp")}
        </AppLink>
      </p>

      {/* Divider */}
      <Divider text={t("orWith")} />

      {/* Social login buttons */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <SocialButton provider="google" />
        <SocialButton provider="apple" />
      </div>
    </form>
  );
}
