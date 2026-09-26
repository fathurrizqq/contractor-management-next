import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Password lama wajib diisi."),

    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .regex(/[A-Z]/, "Password harus memiliki huruf besar.")
      .regex(/[a-z]/, "Password harus memiliki huruf kecil.")
      .regex(/[0-9]/, "Password harus memiliki angka.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password harus memiliki karakter khusus.",
      ),

    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi."),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Konfirmasi password tidak sama.",
      path: ["confirmPassword"],
    },
  );

export async function POST(request: Request) {
  try {
    // 1. Cek apakah user sudah login
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Anda harus login terlebih dahulu.",
        },
        {
          status: 401,
        },
      );
    }

    // 2. Ambil data dari request
    const body = await request.json();

    // 3. Validasi data
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Data password tidak valid.",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const {
      currentPassword,
      newPassword,
    } = result.data;

    // 4. Cari user berdasarkan userId dari session
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    // 5. Pastikan password lama benar
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Password lama salah.",
        },
        {
          status: 401,
        },
      );
    }

    // 6. Jangan izinkan password baru sama dengan password lama
    const samePassword = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    );

    if (samePassword) {
      return NextResponse.json(
        {
          message:
            "Password baru tidak boleh sama dengan password lama.",
        },
        {
          status: 400,
        },
      );
    }

    // 7. Hash password baru
    const newPasswordHash = await bcrypt.hash(
      newPassword,
      12,
    );

    // 8. Update password di database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json(
      {
        message: "Password berhasil diubah.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      },
    );
  }
}

