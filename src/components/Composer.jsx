import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Image,
  X,
  Loader2,
  Music,
  Play,
  Square,
  Check,
  Gamepad2,
} from "lucide-react";

import { Avatar } from "./Shared";
import { compressImage } from "../utils";
import { createPost } from "../hooks";
import { MUSIC_TRACKS, previewTrack, stopTrack } from "../musicLibrary";
import { playPostSound } from "../sounds";

export default function Composer({
  currentUserId,
  profile,
  quotedPost,
  onClearQuote,
  communities = [],
  initialCommunityId,
  users = [],
}) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [compressedImage, setCompressedImage] = useState("");
  const [posting, setPosting] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);

  const [selectedTag, setSelectedTag] = useState("");
  const [activeCommunityId, setActiveCommunityId] = useState(
    initialCommunityId || ""
  );

  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  /* ─────────────────────────────
     COMMUNITY SYNC
  ───────────────────────────── */
  useEffect(() => {
    setActiveCommunityId(initialCommunityId || "");
  }, [initialCommunityId]);

  /* ─────────────────────────────
     AUTO RESIZE TEXTAREA
  ───────────────────────────── */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 200) + "px";
  }, [text]);

  /* ─────────────────────────────
     STOP MUSIC ON CLOSE
  ───────────────────────────── */
  useEffect(() => {
    if (!showMusicPicker) {
      stopTrack();
      setPreviewingId(null);
    }
  }, [showMusicPicker]);

  /* ─────────────────────────────
     IMAGE HANDLER
  ───────────────────────────── */
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/") && file.size > 10 * 1024 * 1024) {
      alert("Video must be under 10MB");
      return;
    }

    setCompressing(true);

    try {
      if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          setImagePreview(base64);
          setCompressedImage(base64);
          setCompressing(false);
        };
        reader.readAsDataURL(file);
      } else {
        const base64 = await compressImage(file, 800, 0.75);
        setImagePreview(base64);
        setCompressedImage(base64);
        setCompressing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process media");
      setCompressing(false);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = () => {
    setImagePreview("");
    setCompressedImage("");
    setSelectedTrack(null);
  };

  /* ─────────────────────────────
     MUSIC
  ───────────────────────────── */
  const handlePreview = (track) => {
    if (previewingId === track.id) {
      stopTrack();
      setPreviewingId(null);
    } else {
      previewTrack(track.id);
      setPreviewingId(track.id);
    }
  };

  const handleSelectTrack = (track) => {
    stopTrack();
    setPreviewingId(null);
    setSelectedTrack(track || null);
    setShowMusicPicker(false);
  };

  /* ─────────────────────────────
     POST
  ───────────────────────────── */
  const handlePost = async () => {
    const finalText = selectedTag
      ? `${selectedTag} ${text.trim()}`
      : text.trim();

    if ((!finalText && !compressedImage && !quotedPost) || posting) return;

    setPosting(true);

    try {
      await createPost(
        currentUserId,
        finalText,
        compressedImage,
        selectedTrack?.id || "",
        selectedTrack?.name || "",
        quotedPost?.id || "",
        quotedPost ? "quote" : "post",
        activeCommunityId || ""
      );

      setText("");
      setImagePreview("");
      setCompressedImage("");
      setSelectedTrack(null);
      setSelectedTag("");

      onClearQuote?.();

      playPostSound();
      window.dispatchEvent(new Event("refreshPosts"));
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }

    setPosting(false);
  };

  const charCount = text.length;
  const maxChars = 280;
  const charPerc = (charCount / maxChars) * 100;

  /* ─────────────────────────────
     UI
  ───────────────────────────── */
  return (
    <div className="px-4 py-3 border-b border-dark-border">
      <div className="flex gap-3">
        <Avatar src={profile?.avatarUrl} name={profile?.displayName} />

        <div className="flex-1">
          {/* Community */}
          {communities.length > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] text-dark-muted uppercase">
                Post to
              </span>
              <select
                value={activeCommunityId}
                onChange={(e) => setActiveCommunityId(e.target.value)}
                className="bg-dark-surface border border-dark-border rounded-md text-xs px-2 py-1"
              >
                <option value="">Public</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quote */}
          {quotedPost && (
            <div className="mb-3 p-3 bg-dark-surface border border-dark-border rounded-xl relative">
              <button
                onClick={onClearQuote}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </button>

              <p className="text-xs text-dark-muted line-clamp-2">
                {quotedPost.text}
              </p>
            </div>
          )}

          {/* TEXT */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="What's happening?"
            className="w-full bg-transparent text-dark-text text-lg outline-none resize-none"
          />

          {/* MEDIA */}
          {imagePreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden">
              {imagePreview.startsWith("data:video/") ? (
                <video controls src={imagePreview} className="w-full" />
              ) : (
                <img src={imagePreview} className="w-full object-cover" />
              )}

              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* MUSIC */}
          {selectedTrack && (
            <div className="mt-2 flex items-center gap-2 p-2 border border-dark-border rounded-xl">
              <Music className="w-4 h-4" />
              <p className="text-sm truncate">{selectedTrack.name}</p>
              <button onClick={() => setSelectedTrack(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TOOLBAR */}
          <div className="flex justify-between items-center mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleImageSelect}
            />

            <button onClick={() => fileRef.current?.click()}>
              <Image className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowMusicPicker(true)}
              disabled={!compressedImage}
            >
              <Music className="w-5 h-5" />
            </button>

            <button
              disabled={posting}
              onClick={handlePost}
              className="bg-brand-primary px-4 py-2 rounded-full text-white"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* MUSIC MODAL */}
      {showMusicPicker && (
        <MusicPickerModal
          tracks={MUSIC_TRACKS}
          selectedTrack={selectedTrack}
          previewingId={previewingId}
          onPreview={handlePreview}
          onSelect={handleSelectTrack}
          onClose={() => setShowMusicPicker(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────
   MUSIC PICKER (clean version)
──────────────────────────── */
function MusicPickerModal({
  tracks,
  selectedTrack,
  previewingId,
  onPreview,
  onSelect,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end">
      <div className="bg-dark-bg w-full rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between mb-3">
          <h2 className="font-bold">Music</h2>
          <button onClick={onClose}>Close</button>
        </div>

        {tracks.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between p-2 border-b border-dark-border"
          >
            <div onClick={() => onSelect(t)}>
              <p className="text-sm">{t.name}</p>
              <p className="text-xs text-dark-muted">{t.artist}</p>
            </div>

            <button onClick={() => onPreview(t)}>
              {previewingId === t.id ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
