"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import PasswordInput from "./components/PasswordInput";
import PasswordRule from "./components/PasswordRule";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = {
    minLength: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match:
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword,
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword) {
      setErrorMessage(
        "Password lama wajib diisi.",
      );
      return;
    }

    if (!passwordRules.minLength) {
      setErrorMessage(
        "Password baru minimal 8 karakter.",
      );
      return;
    }

    if (!passwordRules.uppercase) {
      setErrorMessage(
        "Password baru harus memiliki huruf besar.",
      );
      return;
    }

    if (!passwordRules.lowercase) {
      setErrorMessage(
        "Password baru harus memiliki huruf kecil.",
      );
      return;
    }

    if (!passwordRules.number) {
      setErrorMessage(
        "Password baru harus memiliki angka.",
      );
      return;
    }

    if (!passwordRules.special) {
      setErrorMessage(
        "Password baru harus memiliki karakter khusus.",
      );
      return;
    }

    if (!passwordRules.match) {
      setErrorMessage(
        "Konfirmasi password tidak sama.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Gagal mengubah password.",
        );
        return;
      }

      setSuccessMessage(
        "Password berhasil diubah.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error(
        "CHANGE_PASSWORD_PAGE_ERROR:",
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* HEADER */}
          <div className="mb-6">
            <p className="text-sm text-slate-500">
              Account Security
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Ubah Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gunakan password baru yang kuat dan
              mudah Anda ingat.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <PasswordInput
              label="Password Lama"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrentPassword}
              onToggle={() =>
                setShowCurrentPassword(
                  (current) => !current,
                )
              }
              placeholder="Masukkan password lama"
              autoComplete="current-password"
            />

            <PasswordInput
              label="Password Baru"
              value={newPassword}
              onChange={setNewPassword}
              show={showNewPassword}
              onToggle={() =>
                setShowNewPassword(
                  (current) => !current,
                )
              }
              placeholder="Masukkan password baru"
              autoComplete="new-password"
            />

            {/* PASSWORD RULES */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold text-slate-700">
                Password harus memenuhi:
              </p>

              <ul className="space-y-1 text-xs">
                <PasswordRule
                  valid={passwordRules.minLength}
                >
                  Minimal 8 karakter
                </PasswordRule>

                <PasswordRule
                  valid={passwordRules.uppercase}
                >
                  Mengandung huruf besar
                </PasswordRule>

                <PasswordRule
                  valid={passwordRules.lowercase}
                >
                  Mengandung huruf kecil
                </PasswordRule>

                <PasswordRule
                  valid={passwordRules.number}
                >
                  Mengandung angka
                </PasswordRule>

                <PasswordRule
                  valid={passwordRules.special}
                >
                  Mengandung karakter khusus
                </PasswordRule>
              </ul>
            </div>

            <PasswordInput
              label="Konfirmasi Password Baru"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword(
                  (current) => !current,
                )
              }
              placeholder="Ulangi password baru"
              autoComplete="new-password"
            />

            <div className="rounded-xl bg-slate-50 p-4">
              <PasswordRule
                valid={passwordRules.match}
              >
                Password baru dan konfirmasi sama
              </PasswordRule>
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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-blue-800
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Menyimpan..."
                : "Ubah Password"}
            </button>
          </form>

          {/* BACK */}
          <div className="mt-5 text-center">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}