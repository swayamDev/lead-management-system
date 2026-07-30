"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { publicLeadSchema, type PublicLeadInput } from "@/schemas/lead.schema";

// react-hook-form needs the *input* shape (pre-coercion) for its generic:
// z.coerce.number() accepts unknown but z.infer resolves to the
// post-coercion output type, which causes a resolver/generic mismatch.
type LeadFormValues = z.input<typeof publicLeadSchema>;

const sourceOptions: { value: PublicLeadInput["source"]; label: string }[] = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "COLD_OUTREACH", label: "Cold outreach" },
  { value: "EVENT", label: "Event" },
  { value: "OTHER", label: "Other" },
];

export function LeadCaptureForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(publicLeadSchema),
    defaultValues: { source: "WEBSITE" },
  });

  const sourceValue = useWatch({ control, name: "source" });

  async function onSubmit(values: LeadFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong.");
      }

      setSubmitted(true);
      reset();
      toast.success("Thanks, we'll be in touch shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border-border bg-card rounded-none border p-6 text-sm">
        <p className="font-medium">Thanks for reaching out.</p>
        <p className="text-muted-foreground mt-1">
          A member of our team will follow up soon.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <FieldContent>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <FieldError errors={[{ message: errors.name.message }]} />
            )}
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <FieldError errors={[{ message: errors.email.message }]} />
            )}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <FieldContent>
            <Input id="phone" {...register("phone")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="company">Company</FieldLabel>
          <FieldContent>
            <Input id="company" {...register("company")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="budget">Budget (approx.)</FieldLabel>
          <FieldContent>
            <Input id="budget" type="number" min={0} {...register("budget")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="source">How did you hear about us?</FieldLabel>
          <FieldContent>
            <Select
              value={sourceValue}
              onValueChange={(value) =>
                setValue("source", value as PublicLeadInput["source"])
              }
            >
              <SelectTrigger id="source" className="w-full">
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <FieldContent>
            <Textarea id="message" rows={4} {...register("message")} />
          </FieldContent>
        </Field>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </FieldGroup>
    </form>
  );
}
