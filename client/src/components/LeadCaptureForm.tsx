import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LeadCaptureFormProps {
  heading?: string;
  description?: string;
  source: string;
  context?: string;
  showMessage?: boolean;
  variant?: "inline" | "card" | "banner";
}

export function LeadCaptureForm({
  heading = "Get a Detailed Mission Report",
  description = "Enter your details and we'll send you a personalized analysis.",
  source,
  context,
  showMessage = true,
  variant = "card",
}: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/lead-capture", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim() || undefined,
        source,
        context: context || undefined,
      });
      (window as any).plausible?.("Contact Submit");
      setSubmitted(true);
    } catch {
      setError("We couldn't deliver your request. Please retry, or email vlad@orbit2orbitexpress.com directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={variantClasses(variant)}>
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Thank you, {name}!</p>
            <p className="text-sm text-green-600">We'll be in touch shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={variantClasses(variant)}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{heading}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 border-gray-300"
          />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border-gray-300"
          />
        </div>
        {showMessage && (
          <Textarea
            placeholder="Tell us about your mission (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="border-gray-300 resize-none"
          />
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#e3000f] hover:bg-[#c5000d] text-white font-medium w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {loading ? "Sending..." : "Send"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}

function variantClasses(variant: "inline" | "card" | "banner") {
  switch (variant) {
    case "banner":
      return "border-2 border-[#e3000f] p-6 sm:p-8";
    case "card":
      return "border border-gray-200 bg-white p-6 shadow-sm";
    case "inline":
      return "py-4";
  }
}
