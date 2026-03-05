import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

export type CarouselImage = {
  id: string;
  storagePath: string;
  fileName: string;
  order: number;
};

// ─── Firestore ────────────────────────────────────────────────────────────────

export const fetchCarouselImages = async (): Promise<CarouselImage[]> => {
  const snap = await getDoc(doc(db, "app-config", "carousel"));
  if (!snap.exists()) return [];
  const data = snap.data();
  return ((data.images ?? []) as CarouselImage[]).sort(
    (a, b) => a.order - b.order
  );
};

export const saveCarouselImages = async (images: CarouselImage[]) => {
  await setDoc(
    doc(db, "app-config", "carousel"),
    { images, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// ─── Firebase Storage ─────────────────────────────────────────────────────────

export const uploadCarouselImage = (
  file: File,
  onProgress?: (pct: number) => void
): Promise<CarouselImage> => {
  return new Promise((resolve, reject) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storagePath = `carousel/${id}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) =>
        onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () =>
        resolve({
          id,
          storagePath,
          fileName: file.name,
          order: 0,
        })
    );
  });
};

export const getCarouselImageURL = (storagePath: string): Promise<string> => {
  return getDownloadURL(ref(storage, storagePath));
};

export const deleteCarouselImage = async (storagePath: string) => {
  await deleteObject(ref(storage, storagePath));
};

// ─────────────────────────────────────────────────────────────────────────────
// Game Card Images
// Each image has a `slot` (1-5) so the main app knows which card it belongs to.
// ─────────────────────────────────────────────────────────────────────────────

export type GameCardImage = {
  id: string;
  storagePath: string;
  fileName: string;
  /** Card slot position (1-5). The main app uses this to map the image to the correct card. */
  slot: number;
};

export const fetchGameCardImages = async (): Promise<GameCardImage[]> => {
  const snap = await getDoc(doc(db, "app-config", "game-cards"));
  if (!snap.exists()) return [];
  const data = snap.data();
  return ((data.images ?? []) as GameCardImage[]).sort((a, b) => a.slot - b.slot);
};

export const saveGameCardImages = async (images: GameCardImage[]) => {
  await setDoc(
    doc(db, "app-config", "game-cards"),
    { images, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

export const uploadGameCardImage = (
  file: File,
  slot: number,
  onProgress?: (pct: number) => void
): Promise<GameCardImage> => {
  return new Promise((resolve, reject) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storagePath = `game-cards/${id}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) =>
        onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () =>
        resolve({
          id,
          storagePath,
          fileName: file.name,
          slot,
        })
    );
  });
};

export const getGameCardImageURL = (storagePath: string): Promise<string> => {
  return getDownloadURL(ref(storage, storagePath));
};

export const deleteGameCardImage = async (storagePath: string) => {
  await deleteObject(ref(storage, storagePath));
};

// ─────────────────────────────────────────────────────────────────────────────
// Notice
// Stored in Firestore at app-config/notice — { heading, text, updatedAt }
// ─────────────────────────────────────────────────────────────────────────────

export type NoticeData = {
  heading: string;
  text: string;
};

export const fetchNotice = async (): Promise<NoticeData> => {
  const snap = await getDoc(doc(db, "app-config", "notice"));
  if (!snap.exists()) return { heading: "", text: "" };
  const data = snap.data();
  return {
    heading: data.heading ?? "",
    text: data.text ?? "",
  };
};

export const saveNotice = async (notice: NoticeData) => {
  await setDoc(
    doc(db, "app-config", "notice"),
    { ...notice, updatedAt: serverTimestamp() },
    { merge: true }
  );
};
