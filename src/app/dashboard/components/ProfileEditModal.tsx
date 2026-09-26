"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ProfileEditModalProps = {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
};

export default function ProfileEditModal({
  user,
  onClose,
  onSuccess,
}: ProfileEditModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatar ?? null,
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Format avatar harus JPG, PNG, atau WEBP.",
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        "Ukuran avatar maksimal 5 MB.",
      );

      event.target.value = "";
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  }

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleRemoveSelectedFile() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(user.avatar ?? null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 4) {
      setErrorMessage(
        "Nama minimal 4 karakter.",
      );
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage(
        "Email wajib diisi.",
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", trimmedName);
      formData.append("email", trimmedEmail);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Gagal memperbarui profile.",
        );
        return;
      }

      setSuccessMessage(
        "Profile berhasil diperbarui.",
      );

      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      console.error(
        "PROFILE_UPDATE_ERROR:",
        error,
      );

      setErrorMessage(
        "Terjadi kesalahan pada server.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="profile-edit-title"
              className="text-lg font-semibold text-slate-900"
            >
              Edit Profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Ubah informasi profile Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup edit profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5 sm:p-6"
        >
          {/* AVATAR */}
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={`Foto profile ${user.name}`}
                  fill
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-500">
                  {name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleChooseFile}
                disabled={loading}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedFile
                  ? "Ganti Foto"
                  : "Pilih Foto"}
              </button>

              {selectedFile && (
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  disabled={loading}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal Foto
                </button>
              )}
            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              JPG, PNG, atau WEBP. Maksimal 5 MB.
            </p>
          </div>

          {/* NAME */}
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nama
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={loading}
              placeholder="Masukkan nama"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
              placeholder="Masukkan email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          {/* ROLE */}
          <div>
            <label
              htmlFor="profile-role"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Jabatan
            </label>

            <input
              id="profile-role"
              type="text"
              value={user.role}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Role hanya dapat diubah oleh Admin.
            </p>
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm text-emerald-600">
                {successMessage}
              </p>
            </div>
          )}

          {/* ACTION */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}