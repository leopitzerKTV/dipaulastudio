import { useEffect, useState } from "react";
import { DEFAULT_DRAFT, InviteDraft, Palette, PALETTES } from "@/lib/inviteTypes";
import { loadJSON, persistDraftLocally } from "@/lib/inviteUtils";
import { DRAFT_KEY } from "@/lib/inviteTypes";

export function useInviteDraft(initial?: Partial<InviteDraft> | null) {
  const initialDraft = loadJSON<InviteDraft | null>(DRAFT_KEY, null);
  const mergedInitial = initial ?? initialDraft;
  const initialPalette =
    PALETTES.find((p) => p.id === mergedInitial?.paletteId) ?? PALETTES[0];

  const [brideName, setBrideName] = useState(
    mergedInitial?.brideName ?? DEFAULT_DRAFT.brideName,
  );
  const [groomName, setGroomName] = useState(
    mergedInitial?.groomName ?? DEFAULT_DRAFT.groomName,
  );
  const [date, setDate] = useState(mergedInitial?.date ?? DEFAULT_DRAFT.date);
  const [time, setTime] = useState(mergedInitial?.time ?? DEFAULT_DRAFT.time);
  const [venue, setVenue] = useState(mergedInitial?.venue ?? DEFAULT_DRAFT.venue);
  const [city, setCity] = useState(mergedInitial?.city ?? DEFAULT_DRAFT.city);
  const [message, setMessage] = useState(
    mergedInitial?.message ?? DEFAULT_DRAFT.message,
  );
  const [tagline, setTagline] = useState(
    mergedInitial?.tagline ?? DEFAULT_DRAFT.tagline,
  );
  const [palette, setPalette] = useState<Palette>(initialPalette);
  const [imageSrc, setImageSrc] = useState<string>(
    mergedInitial?.imageSrc ?? DEFAULT_DRAFT.imageSrc,
  );

  const draft: InviteDraft = {
    brideName,
    groomName,
    date,
    time,
    venue,
    city,
    message,
    tagline,
    paletteId: palette.id,
    imageSrc,
  };

  // Autosave to localStorage (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      persistDraftLocally(draft);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brideName, groomName, date, time, venue, city, message, tagline, palette.id, imageSrc]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  return {
    // State
    brideName,
    setBrideName,
    groomName,
    setGroomName,
    date,
    setDate,
    time,
    setTime,
    venue,
    setVenue,
    city,
    setCity,
    message,
    setMessage,
    tagline,
    setTagline,
    palette,
    setPalette,
    imageSrc,
    setImageSrc,

    // Derived
    draft,

    // Handlers
    onPickImage,
  };
}
