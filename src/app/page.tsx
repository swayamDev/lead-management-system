import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadCaptureForm } from "@/components/public/lead-capture-form";

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold">Let&apos;s talk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us a bit about what you need and our team will follow up.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
            <CardDescription>No account needed. This goes straight to our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadCaptureForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
