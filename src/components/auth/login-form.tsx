"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message ?? "Could not sign in. Check your credentials.");
      return;
    }

    toast.success("Signed in");
    router.push(searchParams.get("from") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <FieldError errors={[{ message: errors.email.message }]} />}
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <FieldError errors={[{ message: errors.password.message }]} />
            )}
          </FieldContent>
        </Field>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
