"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createLeadSchema, leadSourceValues } from "@/schemas/lead.schema";

type FormValues = z.input<typeof createLeadSchema>;

export function CreateLeadDialog({
  teamMembers,
}: {
  teamMembers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: { source: "OTHER" },
  });

  const sourceValue = useWatch({ control, name: "source" });
  const assignedToIdValue = useWatch({ control, name: "assignedToId" });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not create lead.");
      }
      toast.success("Lead created");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create lead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>New lead</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a lead</DialogTitle>
          <DialogDescription>
            For leads that came in outside the public form (a call, an event,
            etc).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <FieldContent>
                <Input id="company" {...register("company")} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="source">Source</FieldLabel>
              <FieldContent>
                <Select
                  value={sourceValue}
                  onValueChange={(value) =>
                    setValue("source", value as FormValues["source"])
                  }
                >
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSourceValues.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="assignedToId">Assign to</FieldLabel>
              <FieldContent>
                <Select
                  value={assignedToIdValue ?? ""}
                  onValueChange={(value) =>
                    setValue("assignedToId", value || undefined)
                  }
                >
                  <SelectTrigger id="assignedToId" className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
