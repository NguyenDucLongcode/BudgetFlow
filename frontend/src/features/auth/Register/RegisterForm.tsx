"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("auth");
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
        label={t("nameLabel")}
        placeholder={t("namePlaceholder")}
        leftIcon={<User className="w-4 h-4 text-gray-400" />}
        registration={register("name")}
        error={errors.name}
      />

      {/* Email */}
      <TextField
        id="email"
        label={t("emailLabel")}
        type="email"
        placeholder={t("emailPlaceholder")}
        leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
        registration={register("email")}
        error={errors.email}
      />

      {/* Password */}
      <PasswordField
        id="password"
        label={t("passwordLabel")}
        placeholder={t("createPasswordPlaceholder")}
        registration={register("password")}
        error={errors.password}
      />

      {/* Confirm Password */}
      <PasswordField
        id="confirmPassword"
        label={t("confirmPasswordLabel")}
        placeholder={t("confirmPasswordPlaceholder")}
        registration={register("confirmPassword")}
        error={errors.confirmPassword}
      />

      {/* Submit */}
      <SubmitButton
        className="w-full flex items-center justify-center gap-2"
        isSubmitting={isPending}
        isValid={isValid}
      >
        {t("createAccount")}
      </SubmitButton>

      {/* Login link */}
      <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
        {t("haveAccount")}{" "}
        <AppLink
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          {t("signIn")}
        </AppLink>
      </p>

      {/* Divider */}
      <Divider text={t("orWith")} />

      {/* Social Login */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <SocialButton provider="google" />
        <SocialButton provider="apple" />
      </div>
    </form>
  );
}
