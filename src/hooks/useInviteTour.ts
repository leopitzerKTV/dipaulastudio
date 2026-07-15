import { useEffect, useState } from "react";
import { TOUR_SEEN_KEY } from "@/lib/inviteTypes";

export function useInviteTour() {
  const [tourOpen, setTourOpen] = useState(false);

  // Auto-launch tour on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      const t = window.setTimeout(() => setTourOpen(true), 400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const closeTour = () => {
    setTourOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    }
  };

  return {
    tourOpen,
    setTourOpen,
    closeTour,
  };
}
