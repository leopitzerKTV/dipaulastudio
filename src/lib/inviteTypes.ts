import { Tables, TablesInsert } from "@/integrations/supabase/types";
import ceremonyImg from "@/assets/ceremony.jpg";

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const DRAFT_KEY = "nossahistoria.invite.draft";
export const VERSIONS_KEY = "nossahistoria.invite.versions";
export const BATCH_PARTIAL_KEY = "nossahistoria.invite.batchPartial";
export const BATCH_CLEAR_SKIP_CONFIRM_KEY = "nossahistoria.invite.skipClearConfirm";
export const BATCH_CLEAR_TITLE_KEY = "nossahistoria.invite.clearConfirmTitle";
export const BATCH_CLEAR_MESSAGE_KEY = "nossahistoria.invite.clearConfirmMessage";
export const MIGRATION_FLAG_KEY = "nossahistoria.invite.cloudMigrated";
export const TOUR_SEEN_KEY = "nossahistoria.invite.tourSeen";

// ============================================================================
// CONSTANTS
// ============================================================================

export const MAX_VERSIONS = 12;
export const AUTOSAVE_LABEL = "__autosave__";

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type SavedInviteRow = Tables<"saved_invites">;
export type SavedInviteInsert = TablesInsert<"saved_invites">;

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type InviteDraft = {
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  message: string;
  tagline: string;
  paletteId: string;
  imageSrc: string;
};

export type SavedVersion = InviteDraft & {
  id: string;
  savedAt: number;
  label: string;
  publishedUrl?: string;
};

export type PersistedBatchPartial = {
  pngUrl?: string;
  jpgUrl?: string;
  pdfBase64?: string;
};

export type Palette = {
  id: string;
  name: string;
  bg: string;
  card: string;
  ink: string;
  gold: string;
  goldDeep: string;
  gradient: string;
};

export type TourStep = {
  selector: string;
  title: string;
  body: string;
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_DRAFT: InviteDraft = {
  brideName: "Amanda",
  groomName: "Ricardo",
  date: "24 · Maio · 2025",
  time: "Sábado, às 16h30",
  venue: "Espaço Jardim Secreto",
  city: "São Paulo · SP",
  message: "Com a bênção de nossas famílias, convidamos você para celebrar o nosso amor.",
  tagline: "você está convidado para o nosso casamento",
  paletteId: "champagne",
  imageSrc: ceremonyImg,
};

// ============================================================================
// PALETTES
// ============================================================================

export const PALETTES: Palette[] = [
  {
    id: "champagne",
    name: "Champanhe & Ouro",
    bg: "#f7f1e6",
    card: "#fbf6ec",
    ink: "#3a2a1c",
    gold: "#c9a55b",
    goldDeep: "#9c7a3a",
    gradient: "linear-gradient(135deg,#9c7a3a,#e1c279)",
  },
  {
    id: "ivory",
    name: "Marfim & Ouro Claro",
    bg: "#fbf8f1",
    card: "#ffffff",
    ink: "#2b2218",
    gold: "#d6b773",
    goldDeep: "#a98a44",
    gradient: "linear-gradient(135deg,#b8923f,#ecd292)",
  },
  {
    id: "blush",
    name: "Blush & Ouro Rosê",
    bg: "#f7ecec",
    card: "#fdf5f3",
    ink: "#3a2024",
    gold: "#c79a7a",
    goldDeep: "#a3704f",
    gradient: "linear-gradient(135deg,#a3704f,#e9c0a5)",
  },
  {
    id: "mahogany",
    name: "Mogno & Dourado",
    bg: "#f1ead8",
    card: "#f9f3df",
    ink: "#2a160e",
    gold: "#b7873a",
    goldDeep: "#7c5520",
    gradient: "linear-gradient(135deg,#7c5520,#d6ae5d)",
  },
];

// ============================================================================
// TOUR STEPS
// ============================================================================

export const TOUR_STEPS: TourStep[] = [
  {
    selector: "[data-tour='preview']",
    title: "Preview ao vivo",
    body: "Aqui está seu convite. Tudo que você editar à direita aparece aqui na hora, sem precisar salvar.",
  },
  {
    selector: "[data-tour='names']",
    title: "Nomes do casal",
    body: "Comece pelos nomes da noiva e do noivo — eles ganham destaque no centro do convite.",
  },
  {
    selector: "[data-tour='date']",
    title: "Data, hora e local",
    body: "Defina quando e onde a cerimônia acontece. A data aparece sobre a imagem principal.",
  },
  {
    selector: "[data-tour='message']",
    title: "Mensagem e chamada",
    body: "A 'chamada' é o convite curto no topo; a 'mensagem' é a frase em itálico abaixo da foto.",
  },
  {
    selector: "[data-tour='palette']",
    title: "Paleta de cores",
    body: "Escolha entre Champanhe, Marfim, Blush e Mogno. Toda a identidade visual muda junto.",
  },
  {
    selector: "[data-tour='image']",
    title: "Imagem principal",
    body: "Use uma foto sua na proporção 9:16 para um resultado ideal. Ela vira o coração do convite.",
  },
  {
    selector: "[data-tour='versions']",
    title: "Versões salvas",
    body: "Salve quantas variações quiser e volte a qualquer uma com um clique. Seu rascunho atual é guardado automaticamente.",
  },
  {
    selector: "[data-tour='export']",
    title: "Exportar arquivos",
    body: "Baixe o convite em PNG, JPG ou PDF A4, ou gere o ZIP em lote com os três arquivos prontos.",
  },
];
