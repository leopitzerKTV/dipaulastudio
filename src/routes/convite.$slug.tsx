import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Share2, Download, Heart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { QRCodeButton } from "@/components/QRCodeButton";
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedButton,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import ceremonyImg from "@/assets/ceremony.jpg";

type SavedInviteRow = Tables<"saved_invites">;

function resolveImageSrc(row: SavedInviteRow): string {
  if (row.image_data_url) return row.image_data_url;
  if (row.image_storage_path) {
    const { data } = supabase.storage.from("invites").getPublicUrl(row.image_storage_path);
    if (data.publicUrl) return data.publicUrl;
  }
  return ceremonyImg;
}

function mapRowToDraft(row: SavedInviteRow) {
  return {
    brideName: row.bride_name ?? "",
    groomName: row.groom_name ?? "",
    date: row.date ?? "",
    time: row.time ?? "",
    venue: row.venue ?? "",
    city: row.city ?? "",
    message: row.message ?? "",
    tagline: row.tagline ?? "",
    paletteId: row.palette_id ?? "champagne",
    imageSrc: resolveImageSrc(row),
  };
}

type Palette = {
  id: string;
  bg: string;
  card: string;
  ink: string;
  gold: string;
  goldDeep: string;
  gradient: string;
};

const PALETTES: Record<string, Palette> = {
  champagne: {
    id: "champagne",
    bg: "#f7f1e6",
    card: "#fbf6ec",
    ink: "#3a2a1c",
    gold: "#c9a55b",
    goldDeep: "#9c7a3a",
    gradient: "linear-gradient(135deg,#9c7a3a,#e1c279)",
  },
  ivory: {
    id: "ivory",
    bg: "#fbf8f1",
    card: "#ffffff",
    ink: "#2b2218",
    gold: "#d6b773",
    goldDeep: "#a98a44",
    gradient: "linear-gradient(135deg,#b8923f,#ecd292)",
  },
  blush: {
    id: "blush",
    bg: "#f7ecec",
    card: "#fdf5f3",
    ink: "#3a2024",
    gold: "#c79a7a",
    goldDeep: "#a3704f",
    gradient: "linear-gradient(135deg,#a3704f,#e9c0a5)",
  },
  mahogany: {
    id: "mahogany",
    bg: "#f1ead8",
    card: "#f9f3df",
    ink: "#2a160e",
    gold: "#b7873a",
    goldDeep: "#7c5520",
    gradient: "linear-gradient(135deg,#7c5520,#d6ae5d)",
  },
};

function InvitePreview({ invite }: { invite: SavedInviteRow }) {
  const draft = mapRowToDraft(invite);
  const palette = PALETTES[draft.paletteId] || PALETTES.champagne;
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (invite.id) {
      const key = `liked-${invite.id}`;
      const saved = window.localStorage.getItem(key) === "1";
      setLiked(saved);
    }
  }, [invite.id]);

  async function onLike() {
    if (!invite.id) return;
    const next = !liked;
    setLiked(next);
    window.localStorage.setItem(`liked-${invite.id}`, next ? "1" : "0");
    if (next) {
      toast.success("💝 Você curtiu este convite!");
    }
  }

  async function onShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Convite de Casamento", url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("🔗 Link copiado!");
    }
  }

  async function onDownload() {
    const element = document.getElementById("invite-card");
    if (!element) return;
    const { toPng } = await import("html-to-image");
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: palette.bg,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `convite-${draft.brideName}-${draft.groomName}.png`
        .toLowerCase()
        .replace(/\s+/g, "-");
      a.click();
      toast.success("📥 Imagem baixada!");
    } catch {
      toast.error("Não foi possível baixar o convite.");
    }
  }

  return (
    <AnimatedContainer>
      <div
        className="min-h-screen bg-[var(--bg)]"
        style={
          {
            "--bg": palette.bg,
            "--card": palette.card,
            "--ink": palette.ink,
            "--gold": palette.gold,
            "--gold-deep": palette.goldDeep,
          } as React.CSSProperties
        }
      >
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <StaggerContainer>
            <div className="mb-6 flex items-center justify-between">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-[var(--gold-deep)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </a>
              <StaggerItem>
                <div className="flex gap-2 flex-wrap">
                  <QRCodeButton url={window.location.href} label="QR Code" />
                  <AnimatedButton
                    onClick={onShare}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
                  >
                    <Share2 className="h-3 w-3" /> Compartilhar
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={onDownload}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
                  >
                    <Download className="h-3 w-3" /> Baixar
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={onLike}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      liked
                        ? "border-red-400/40 bg-red-50 text-red-600"
                        : "border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${liked ? "fill-current" : ""}`} />{" "}
                    {liked ? "Curtido" : "Curtir"}
                  </AnimatedButton>
                </div>
              </StaggerItem>
            </div>

            <AnimatedCard>
              <div
                id="invite-card"
                className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-[var(--shadow-luxe)]"
                style={{ boxShadow: "0 12px 40px -12px rgba(0,0,0,0.25)" }}
              >
                <div className="aspect-[9/16] bg-[var(--card)] p-8 flex flex-col justify-between text-center">
                  <StaggerContainer>
                    <div>
                      <h1 className="font-serif text-3xl font-light text-[var(--ink)] mb-2">
                        {draft.brideName}
                      </h1>
                      <h2 className="font-serif text-3xl font-light text-[var(--ink)] mb-1">
                        {draft.groomName}
                      </h2>
                      <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent my-4" />
                      <p className="font-serif-caps text-[11px] tracking-widest text-[var(--gold-deep)] uppercase mb-6">
                        {draft.tagline}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <StaggerItem>
                        <div className="relative h-48 w-full rounded-lg overflow-hidden bg-[var(--bg)]">
                          <img
                            src={draft.imageSrc}
                            alt="Ceremony"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      </StaggerItem>

                      <StaggerItem className="space-y-2">
                        <p className="font-serif text-lg text-[var(--ink)]">{draft.date}</p>
                        <p className="font-serif-caps text-[12px] text-[var(--gold-deep)]">
                          {draft.time}
                        </p>
                        <p className="font-serif text-base text-[var(--ink)]">{draft.venue}</p>
                        <p className="font-serif-caps text-[11px] text-[var(--gold-deep)]">
                          {draft.city}
                        </p>
                      </StaggerItem>

                      <StaggerItem>
                        <div className="pt-4 border-t border-[var(--gold)]/20">
                          <p className="font-serif text-sm text-[var(--ink)] leading-relaxed">
                            {draft.message}
                          </p>
                        </div>
                      </StaggerItem>
                    </div>
                  </StaggerContainer>
                </div>
              </div>
            </AnimatedCard>

            <StaggerItem>
              <div className="mt-8 text-center">
                <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]/60 uppercase tracking-widest">
                  Com amor —{" "}
                  {new Date(invite.updated_at ?? invite.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </AnimatedContainer>
  );
}

export const Route = createFileRoute("/convite/$slug")({
  component: InviteSlugRoute,
});

function InviteSlugRoute() {
  const { slug } = Route.useParams();
  const [invite, setInvite] = useState<SavedInviteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from("saved_invites")
          .select("*")
          .eq("published_url", slug)
          .eq("is_published", true)
          .single();
        if (fetchError) throw fetchError;
        if (!data) throw new Error("Convite não encontrado");
        if (!cancelled) {
          setInvite(data);
          // Increment view count
          await supabase.rpc("increment_view_count", { invite_id: data.id });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar convite");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
            <p className="mt-4 font-serif text-sm text-[var(--cocoa)]">Carregando convite...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !invite) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--gold)]/25 bg-white/70 p-8 text-center shadow-[var(--shadow-luxe)]">
            <h1 className="font-display text-2xl text-[var(--cocoa)]">Convite não encontrado</h1>
            <p className="mt-2 text-sm text-[var(--cocoa)]/65">{error}</p>
            <a
              href="/"
              className="mt-5 inline-block rounded-full bg-[var(--gold-deep)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--gold)] transition-colors"
            >
              Voltar para o início
            </a>
          </div>
        </div>
      </AppShell>
    );
  }

  return <InvitePreview invite={invite} />;
}
