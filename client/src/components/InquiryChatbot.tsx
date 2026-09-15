import { useState, useEffect } from "react";
import { MessageCircle, X, Send, CheckCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

type ChatState = "closed" | "greeting" | "form" | "sending" | "sent";

export default function InquiryChatbot() {
  const [state, setState] = useState<ChatState>("closed");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [payload, setPayload] = useState("");
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    if (hasAutoOpened) return;
    const isMobileOrTablet = window.innerWidth < 1024;
    if (isMobileOrTablet) {
      setHasAutoOpened(true);
      return;
    }
    const timer = setTimeout(() => {
      setState("greeting");
      setHasAutoOpened(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened]);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    setState("sending");
    setError("");
    try {
      await apiRequest("POST", "/api/inquiry", {
        name: name.trim(),
        email: email.trim(),
        payload: payload.trim(),
      });
      setState("sent");
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
      setState("form");
    }
  };

  if (state === "closed") {
    return (
      <button
        onClick={() => setState("greeting")}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-rail-red text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
        aria-label="Open inquiry chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-80 bg-white border-2 border-gray-200 shadow-xl flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between p-3 bg-gray-900 text-white">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-rail-red" />
          <span className="text-sm font-medium">O2O Mission Inquiry</span>
        </div>
        <button
          onClick={() => setState("closed")}
          className="p-1 hover:bg-white/10 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state === "greeting" && (
          <>
            <div className="bg-gray-50 border border-gray-200 p-3">
              <p className="text-sm text-gray-700">
                Welcome to Orbit 2 Orbit Express! I can help you with payload inquiries, launch logistics, or answer questions about our platform.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState("form")}
                className="w-full min-h-[44px] text-left justify-start border-gray-200 text-gray-700 hover:border-rail-red hover:text-rail-red"
              >
                I have a payload inquiry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState("form")}
                className="w-full min-h-[44px] text-left justify-start border-gray-200 text-gray-700 hover:border-rail-red hover:text-rail-red"
              >
                I need help with mission planning
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = "mailto:vlad@orbit2orbitexpress.com";
                  setState("closed");
                }}
                className="w-full min-h-[44px] text-left justify-start border-gray-200 text-gray-700 hover:border-rail-red hover:text-rail-red"
              >
                Just send an email
              </Button>
            </div>
          </>
        )}

        {(state === "form" || state === "sending") && (
          <>
            <div className="bg-gray-50 border border-gray-200 p-3">
              <p className="text-sm text-gray-700">
                Tell us about your mission and we'll get back to you within 24 hours.
              </p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  disabled={state === "sending"}
                  className="min-h-[44px] border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  disabled={state === "sending"}
                  className="min-h-[44px] border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Payload / Question</label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="Describe your payload, mission requirements, or ask a question..."
                  rows={3}
                  disabled={state === "sending"}
                  className="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-rail-red/20 focus:border-rail-red min-h-[80px] resize-none"
                />
              </div>
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <Button
                type="submit"
                disabled={state === "sending" || !name.trim() || !email.trim()}
                className="w-full min-h-[44px] bg-rail-red hover:bg-red-700 text-white font-medium"
              >
                {state === "sending" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Inquiry
                  </span>
                )}
              </Button>
            </form>
          </>
        )}

        {state === "sent" && (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">Inquiry Sent!</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll get back to you at <strong>{email}</strong> within 24 hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState("closed")}
              className="border-gray-300 min-h-[44px]"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
