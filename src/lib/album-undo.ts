// Sistema de undo para exclusão de fotos do álbum
// Permite desfazer exclusões dentro de uma janela de tempo

type PendingDelete = {
  id: string;
  photo: {
    id: string;
    storage_path: string;
    author_name: string | null;
    caption: string | null;
    tag: string;
    created_at: string;
  };
  trashPath: string;
  timestamp: number;
};

type RestoreHandler = (photo: PendingDelete["photo"]) => void;

// Estado global para armazenar exclusões pendentes
let pendingDeletes: PendingDelete[] = [];
let subscribers: Set<() => void> = new Set();
let restoreHandler: RestoreHandler | null = null;

const PENDING_DELETE_KEY = "album.pendingDeletes";
const UNDO_WINDOW_MS = 5000; // 5 segundos para desfazer

// Carregar exclusões pendentes do localStorage
function loadPendingDeletes(): PendingDelete[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PENDING_DELETE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Salvar exclusões pendentes no localStorage
function savePendingDeletes(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_DELETE_KEY, JSON.stringify(pendingDeletes));
  } catch {
    // Ignorar erros de localStorage
  }
}

// Limpar exclusões expiradas
function cleanupExpiredDeletes(): void {
  const now = Date.now();
  const beforeCount = pendingDeletes.length;
  pendingDeletes = pendingDeletes.filter(item => now - item.timestamp < UNDO_WINDOW_MS);
  if (pendingDeletes.length !== beforeCount) {
    savePendingDeletes();
    notifySubscribers();
  }
}

// Notificar todos os assinantes
function notifySubscribers(): void {
  subscribers.forEach(callback => callback());
}

// Agendar uma exclusão pendente
export function schedulePendingDelete(
  photo: PendingDelete["photo"],
  trashPath: string
): void {
  const pendingDelete: PendingDelete = {
    id: crypto.randomUUID(),
    photo,
    trashPath,
    timestamp: Date.now(),
  };

  pendingDeletes.push(pendingDelete);
  savePendingDeletes();
  notifySubscribers();

  // Agendar limpeza automática após a janela de undo
  setTimeout(() => {
    cleanupExpiredDeletes();
  }, UNDO_WINDOW_MS);
}

// Cancelar uma exclusão pendente (undo)
export async function cancelPendingDelete(photoId: string): Promise<void> {
  const pending = pendingDeletes.find(item => item.photo.id === photoId);
  if (!pending) return;

  try {
    // Restaurar o arquivo do trash para o caminho original
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { error: moveErr } = await supabase.storage
      .from("album-photos")
      .move(pending.trashPath, pending.photo.storage_path);

    if (moveErr) {
      console.error("Erro ao restaurar arquivo:", moveErr);
      return;
    }

    // Re-inserir a foto no banco de dados
    const { error: insertErr } = await supabase
      .from("album_photos")
      .insert({
        id: pending.photo.id,
        storage_path: pending.photo.storage_path,
        author_name: pending.photo.author_name,
        caption: pending.photo.caption,
        tag: pending.photo.tag,
        created_at: pending.photo.created_at,
      });

    if (insertErr) {
      console.error("Erro ao restaurar foto no banco:", insertErr);
      // Tentar reverter o movimento do arquivo
      await supabase.storage
        .from("album-photos")
        .move(pending.photo.storage_path, pending.trashPath);
      return;
    }

    // Remover da lista de pendentes
    pendingDeletes = pendingDeletes.filter(item => item.id !== pending.id);
    savePendingDeletes();
    notifySubscribers();

    // Notificar o handler de restauração
    if (restoreHandler) {
      restoreHandler(pending.photo);
    }

    // Mostrar toast de sucesso
    const { toast } = await import("sonner");
    toast.success("Foto restaurada", {
      description: "A foto foi restaurada com sucesso.",
    });

  } catch (error) {
    console.error("Erro ao cancelar exclusão:", error);
  }
}

// Obter IDs de fotos com exclusão pendente
export function getPendingDeleteIds(): Set<string> {
  cleanupExpiredDeletes();
  return new Set(pendingDeletes.map(item => item.photo.id));
}

// Obter o ID mais recente de exclusão pendente
export function getLatestPendingId(): string | null {
  cleanupExpiredDeletes();
  if (pendingDeletes.length === 0) return null;
  
  // Retornar o mais recente
  const latest = pendingDeletes.reduce((prev, current) => 
    current.timestamp > prev.timestamp ? current : prev
  );
  
  return latest.photo.id;
}

// Inscrever para receber notificações de mudanças
export function subscribePendingDeletes(callback: () => void): () => void {
  subscribers.add(callback);
  
  // Cleanup automático a cada segundo
  const interval = setInterval(cleanupExpiredDeletes, 1000);
  
  return () => {
    subscribers.delete(callback);
    clearInterval(interval);
  };
}

// Definir o handler de restauração
export function setAlbumRestoreHandler(handler: RestoreHandler | null): void {
  restoreHandler = handler;
}

// Inicializar o sistema
if (typeof window !== "undefined") {
  pendingDeletes = loadPendingDeletes();
  cleanupExpiredDeletes();
}
