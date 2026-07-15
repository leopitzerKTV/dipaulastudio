import { createFileRoute } from "@tanstack/react-router";
import { CoupleGate } from "@/components/CoupleGate";
import { EditorTour, type TourStep } from "@/components/EditorTour";
import {
  EditorHeader,
  EditorPreview,
  EditorForm,
  BatchExportModals,
} from "@/components/editor-shared";
import {
  PALETTES,
  TOUR_STEPS,
  TOUR_SEEN_KEY,
  BATCH_CLEAR_MESSAGE_KEY,
  BATCH_CLEAR_TITLE_KEY,
} from "@/lib/inviteTypes";
import { useInviteDraft } from "@/hooks/useInviteDraft";
import { useInviteAuth } from "@/hooks/useInviteAuth";
import { useInviteExport } from "@/hooks/useInviteExport";
import { useBatchExport } from "@/hooks/useBatchExport";
import { useInviteTour } from "@/hooks/useInviteTour";
import { useInviteVersions } from "@/hooks/useInviteVersions";
import { useInvitePublish } from "@/hooks/useInvitePublish";

export const Route = createFileRoute("/editor")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editor do Convite — Nossa História" },
      {
        name: "description",
        content:
          "Personalize seu convite digital: nomes, data, mensagem, cores e imagem. Exporte em alta resolução.",
      },
    ],
  }),
  component: () => (
    <CoupleGate>
      <Editor />
    </CoupleGate>
  ),
});

function Editor() {
  // Core draft state
  const {
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
    draft,
    onPickImage,
  } = useInviteDraft();

  // Auth and cloud sync
  const { userId, autosaveReady, draftRowId, setDraftRowId, hydratedFromCloud } =
    useInviteAuth(draft);

  // Individual export
  const {
    previewRef,
    exporting,
    exportingPdf,
    exportingJpg,
    renderHighResPng,
    onExport,
    onExportJpg,
    onExportPdf,
  } = useInviteExport(palette);

  // Batch export
  const {
    batchPartial,
    batchPreview,
    batchProgress,
    exportingZip,
    preparingBatch,
    cancellingBatch,
    cancelled,
    showCancelConfirm,
    showClearConfirm,
    skipClearConfirm,
    setSkipClearConfirm,
    clearConfirmTitle,
    setClearConfirmTitle,
    clearConfirmMessage,
    setClearConfirmMessage,
    onPrepareBatch,
    closeBatchPreview,
    confirmDownloadZip,
    promptCancelBatch,
    confirmCancelBatch,
    dismissCancelConfirm,
    promptClearBatchProgress,
    dismissClearBatchProgress,
    confirmClearBatchProgress,
  } = useBatchExport(previewRef, palette, draft);

  // Tour state
  const { tourOpen, setTourOpen, closeTour } = useInviteTour();

  // Versions (saved invites)
  const {
    versions,
    savingVersion,
    saveVersion,
    loadVersion,
    deleteVersion,
    publishing,
    publishInvite,
    unpublishing,
    unpublishInvite,
  } = useInviteVersions(brideName, groomName, draft, userId, draftRowId, setDraftRowId);

  // Publishing utilities
  const { getPublicUrl, incrementShareCount } = useInvitePublish();

  // Auto-status for header
  const anyExporting =
    exporting || exportingPdf || exportingJpg || exportingZip || preparingBatch;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `radial-gradient(ellipse at top, ${palette.gold}22, transparent 60%), ${palette.bg}`,
      }}
    >
      <EditorHeader
        palette={palette}
        autoStatus={
          hydratedFromCloud.current && !autosaveReady
            ? "saving"
            : autosaveReady
              ? "saved"
              : "ready"
        }
        exporting={exporting}
        exportingJpg={exportingJpg}
        exportingPdf={exportingPdf}
        anyExporting={anyExporting}
        preparingBatch={preparingBatch}
        batchPartial={!!batchPartial}
        onExport={onExport}
        onExportJpg={onExportJpg}
        onExportPdf={onExportPdf}
        onPrepareBatch={onPrepareBatch}
        onTourOpen={() => setTourOpen(true)}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <EditorPreview
          previewRef={previewRef}
          brideName={brideName}
          groomName={groomName}
          date={date}
          time={time}
          venue={venue}
          city={city}
          message={message}
          tagline={tagline}
          palette={palette}
          imageSrc={imageSrc}
        />

        <EditorForm
          brideName={brideName}
          setBrideName={setBrideName}
          groomName={groomName}
          setGroomName={setGroomName}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          venue={venue}
          setVenue={setVenue}
          city={city}
          setCity={setCity}
          tagline={tagline}
          setTagline={setTagline}
          message={message}
          setMessage={setMessage}
          palette={palette}
          setPalette={setPalette}
          PALETTES={PALETTES}
          onPickImage={onPickImage}
          versions={versions}
          savingVersion={savingVersion}
          saveVersion={saveVersion}
          loadVersion={loadVersion}
          deleteVersion={deleteVersion}
          publishing={publishing}
          publishInvite={publishInvite}
          unpublishing={unpublishing}
          unpublishInvite={unpublishInvite}
          getPublicUrl={getPublicUrl}
          incrementShareCount={incrementShareCount}
          clearConfirmTitle={clearConfirmTitle}
          setClearConfirmTitle={setClearConfirmTitle}
          clearConfirmMessage={clearConfirmMessage}
          setClearConfirmMessage={setClearConfirmMessage}
          onExport={onExport}
          exporting={exporting}
          onExportJpg={onExportJpg}
          exportingJpg={exportingJpg}
          onExportPdf={onExportPdf}
          exportingPdf={exportingPdf}
          anyExporting={anyExporting}
          onPrepareBatch={onPrepareBatch}
          batchPartial={!!batchPartial}
          preparingBatch={preparingBatch}
          promptClearBatchProgress={promptClearBatchProgress}
        />
      </div>

      <BatchExportModals
        preparingBatch={preparingBatch}
        batchProgress={batchProgress}
        showCancelConfirm={showCancelConfirm}
        cancelled={cancelled}
        cancellingBatch={cancellingBatch}
        batchPartial={batchPartial}
        palette={palette}
        batchPreview={batchPreview}
        exportingZip={exportingZip}
        showClearConfirm={showClearConfirm}
        clearConfirmTitle={clearConfirmTitle}
        clearConfirmMessage={clearConfirmMessage}
        skipClearConfirm={skipClearConfirm}
        preparingBatchCount={preparingBatch ? 1 : 0}
        brideName={brideName}
        groomName={groomName}
        onPromptCancelBatch={promptCancelBatch}
        onDismissCancelConfirm={dismissCancelConfirm}
        onConfirmCancelBatch={confirmCancelBatch}
        onCloseBatchPreview={closeBatchPreview}
        onPrepareBatch={onPrepareBatch}
        onConfirmDownloadZip={confirmDownloadZip}
        onDismissClearBatchProgress={dismissClearBatchProgress}
        onConfirmClearBatchProgress={confirmClearBatchProgress}
        onSetSkipClearConfirm={setSkipClearConfirm}
      />

      <EditorTour steps={TOUR_STEPS} open={tourOpen} onClose={closeTour} />
    </div>
  );
}
