import {
  Type,
  Calendar,
  Palette as PaletteIcon,
  Image as ImageIcon,
  History,
  Save,
  Loader2,
  Share2,
  Trash2,
  AlertTriangle,
  Download,
  FileImage,
  FileDown,
  Package,
} from "lucide-react";
import { Field } from "./Field";
import { Section } from "./Section";
import type { Palette, SavedVersion } from "../../lib/inviteTypes";

export function EditorForm({
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
  tagline,
  setTagline,
  message,
  setMessage,
  palette,
  setPalette,
  PALETTES,
  onPickImage,
  versions,
  savingVersion,
  saveVersion,
  loadVersion,
  deleteVersion,
  publishing,
  publishInvite,
  unpublishing,
  unpublishInvite,
  getPublicUrl,
  incrementShareCount,
  clearConfirmTitle,
  setClearConfirmTitle,
  clearConfirmMessage,
  setClearConfirmMessage,
  onExport,
  exporting,
  onExportJpg,
  exportingJpg,
  onExportPdf,
  exportingPdf,
  anyExporting,
  onPrepareBatch,
  batchPartial,
  preparingBatch,
  promptClearBatchProgress,
}: {
  brideName: string;
  setBrideName: (value: string) => void;
  groomName: string;
  setGroomName: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  venue: string;
  setVenue: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  tagline: string;
  setTagline: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
  PALETTES: Palette[];
  onPickImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  versions: SavedVersion[];
  savingVersion: boolean;
  saveVersion: () => void;
  loadVersion: (version: SavedVersion) => void;
  deleteVersion: (id: string) => Promise<void>;
  publishing: boolean;
  publishInvite: (id: string, brideName: string, groomName: string) => Promise<string | null>;
  unpublishing: boolean;
  unpublishInvite: (id: string) => Promise<void>;
  getPublicUrl: (slug: string) => string;
  incrementShareCount: (id: string) => void;
  clearConfirmTitle: string;
  setClearConfirmTitle: (value: string) => void;
  clearConfirmMessage: string;
  setClearConfirmMessage: (value: string) => void;
  onExport: () => void;
  exporting: boolean;
  onExportJpg: () => void;
  exportingJpg: boolean;
  onExportPdf: () => void;
  exportingPdf: boolean;
  anyExporting: boolean;
  onPrepareBatch: () => void;
  batchPartial: boolean;
  preparingBatch: boolean;
  promptClearBatchProgress: () => void;
}) {
  return (
    <aside className="space-y-5">
      <div data-tour="names">
        <Section icon={Type} title="Nomes do casal">
          <Field label="Noiva" value={brideName} onChange={setBrideName} />
          <Field label="Noivo" value={groomName} onChange={setGroomName} />
        </Section>
      </div>

      <div data-tour="date">
        <Section icon={Calendar} title="Data & cerimônia">
          <Field label="Data" value={date} onChange={setDate} />
          <Field label="Hora" value={time} onChange={setTime} />
          <Field label="Local" value={venue} onChange={setVenue} />
          <Field label="Cidade" value={city} onChange={setCity} />
        </Section>
      </div>

      <div data-tour="message">
        <Section icon={Type} title="Mensagem">
          <Field label="Chamada" value={tagline} onChange={setTagline} />
          <Field label="Convite" value={message} onChange={setMessage} multiline />
        </Section>
      </div>

      <div data-tour="palette">
        <Section icon={PaletteIcon} title="Paleta">
          <div className="grid grid-cols-2 gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPalette(p)}
                className={`rounded-xl border p-2 text-left transition-all ${
                  palette.id === p.id
                    ? "border-[var(--gold-deep)] shadow-[var(--shadow-card)]"
                    : "border-[var(--gold)]/25 hover:border-[var(--gold)]/60"
                }`}
                style={{ background: p.card }}
              >
                <div className="flex gap-1">
                  <span className="h-5 w-5 rounded-full" style={{ background: p.gold }} />
                  <span className="h-5 w-5 rounded-full" style={{ background: p.goldDeep }} />
                  <span
                    className="h-5 w-5 rounded-full border border-[var(--gold)]/30"
                    style={{ background: p.bg }}
                  />
                </div>
                <p className="mt-1.5 font-display text-xs" style={{ color: p.ink }}>
                  {p.name}
                </p>
              </button>
            ))}
          </div>
        </Section>
      </div>

      <div data-tour="image">
        <Section icon={ImageIcon} title="Imagem principal">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--gold)]/45 bg-[var(--card)] px-3 py-4 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/5">
            <ImageIcon className="h-3.5 w-3.5" />
            Escolher imagem (9:16)
            <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          </label>
        </Section>
      </div>

      <div data-tour="versions">
        <Section icon={History} title="Versões salvas">
          <button
            onClick={saveVersion}
            disabled={savingVersion}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingVersion ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
              </>
            ) : (
              <>
                <Save className="h-3 w-3" /> Salvar versão atual
              </>
            )}
          </button>
          {versions.length === 0 ? (
            <p className="text-center font-display text-[12px] italic text-[var(--cocoa)]/50">
              Nenhuma versão salva ainda. Seu rascunho é guardado automaticamente.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-[var(--gold)]/20 bg-[var(--ivory)] px-2.5 py-2"
                >
                  <div className="flex-1">
                    <button onClick={() => loadVersion(v)} className="text-left w-full">
                      <p className="font-display text-sm text-[var(--cocoa)] leading-tight">
                        {v.label}
                      </p>
                      <p className="font-serif-caps text-[9px] text-[var(--gold-deep)]/70">
                        {new Date(v.savedAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </button>
                    {v.publishedUrl && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <a
                          href={getPublicUrl(v.publishedUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => incrementShareCount(v.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
                        >
                          <Share2 className="h-2.5 w-2.5" /> Ver convite
                        </a>
                        <button
                          onClick={() => unpublishInvite(v.id)}
                          disabled={unpublishing}
                          className="rounded-full border border-red-400/40 bg-red-50 px-2 py-0.5 text-[9px] font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          Despublicar
                        </button>
                      </div>
                    )}
                    {!v.publishedUrl && (
                      <button
                        onClick={() =>
                          publishInvite(v.id, brideName, groomName).then((slug) => {
                            if (slug) {
                              loadVersion({
                                ...v,
                                publishedUrl: slug,
                              });
                            }
                          })
                        }
                        disabled={publishing}
                        className="mt-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20 disabled:opacity-60"
                      >
                        {publishing ? "Publicando..." : "Publicar"}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => deleteVersion(v.id)}
                    className="rounded-md p-1.5 text-[var(--cocoa)]/40 hover:bg-red-50 hover:text-red-500"
                    aria-label="Excluir versão"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section icon={AlertTriangle} title="Aviso de apagar progresso">
        <Field
          label="Título do modal"
          value={clearConfirmTitle}
          onChange={setClearConfirmTitle}
        />
        <Field
          label="Mensagem do modal"
          value={clearConfirmMessage}
          onChange={setClearConfirmMessage}
          multiline
        />
        <button
          onClick={() => {
            setClearConfirmTitle("Apagar progresso salvo?");
            setClearConfirmMessage(
              "Você tem um progresso de geração salvo. Se apagar, perderá o que já foi renderizado de PNG, JPG e PDF e terá que começar do zero.",
            );
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
        >
          <Trash2 className="h-3 w-3" /> Restaurar texto padrão
        </button>
      </Section>

      <div data-tour="export" className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onExport}
            disabled={anyExporting}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--gold-deep)]/40 bg-[var(--ivory)] py-3 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? "…" : "PNG 9:16"}
          </button>
          <button
            onClick={onExportJpg}
            disabled={anyExporting}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--gold-deep)]/40 bg-[var(--ivory)] py-3 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
          >
            <FileImage className="h-4 w-4" />
            {exportingJpg ? "…" : "JPG 9:16"}
          </button>
          <button
            onClick={onExportPdf}
            disabled={anyExporting}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl py-3 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-card)] disabled:opacity-60"
            style={{ background: palette.gradient }}
          >
            <FileDown className="h-4 w-4" />
            {exportingPdf ? "…" : "PDF A4"}
          </button>
        </div>
        <button
          onClick={onPrepareBatch}
          disabled={anyExporting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--cocoa)] py-3 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-card)] hover:opacity-90 disabled:opacity-60"
        >
          <Package className="h-4 w-4" />
          {preparingBatch
            ? "Preparando prévia…"
            : batchPartial
              ? "Retomar prévia (PNG + JPG + PDF)"
              : "Prévia em lote (PNG + JPG + PDF)"}
        </button>

        {batchPartial && (
          <button
            onClick={promptClearBatchProgress}
            disabled={preparingBatch}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 font-serif-caps text-[10px] text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-3 w-3" />
            Limpar progresso salvo e recomeçar
          </button>
        )}
      </div>
    </aside>
  );
}
