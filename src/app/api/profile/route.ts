import { NextResponse } from "next/server";

import { promises as fs } from "fs";
import path from "path";

import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, "Nama minimal 4 karakter.")
    .max(100, "Nama maksimal 100 karakter."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid.")
    .max(150, "Email terlalu panjang."),
});

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function isLocalAvatarPath(
  avatar: string | null | undefined,
): avatar is string {
  return (
    typeof avatar === "string" &&
    avatar.startsWith("/uploads/avatars/")
  );
}

async function deleteOldAvatar(
  avatar: string | null | undefined,
) {
  // Pastikan avatar benar-benar string
  // dan merupakan path avatar lokal.
  if (!isLocalAvatarPath(avatar)) {
    return;
  }

  // Setelah pengecekan di atas,
  // TypeScript sudah tahu bahwa avatar adalah string.
  const relativePath = avatar.replace(
    /^\/+/,
    "",
  );

  const filePath = path.join(
    process.cwd(),
    "public",
    relativePath,
  );

  try {
    await fs.unlink(filePath);
  } catch (error) {
    const code =
      error &&
      typeof error === "object" &&
      "code" in error
        ? error.code
        : null;

    // ENOENT = file memang sudah tidak ada.
    // Jadi tidak perlu dianggap sebagai error fatal.
    if (code !== "ENOENT") {
      console.error(
        "DELETE_OLD_AVATAR_ERROR:",
        error,
      );
    }
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    // ==========================================
    // 1. CEK SESSION
    // ==========================================

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Anda belum login.",
        },
        {
          status: 401,
        },
      );
    }

    // ==========================================
    // 2. CARI USER
    // ==========================================

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: session.userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
      });

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================
    // 3. AMBIL FORM DATA
    // ==========================================

    const formData =
      await request.formData();

    const nameValue =
      formData.get("name");

    const emailValue =
      formData.get("email");

    const avatarValue =
      formData.get("avatar");

    // ==========================================
    // 4. VALIDASI NAMA DAN EMAIL
    // ==========================================

    const validation =
      profileSchema.safeParse({
        name:
          typeof nameValue === "string"
            ? nameValue
            : "",

        email:
          typeof emailValue === "string"
            ? emailValue
            : "",
      });

    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            "Data profile tidak valid.",

          errors:
            validation.error.flatten()
              .fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const {
      name,
      email,
    } = validation.data;

    // ==========================================
    // 5. CEK EMAIL DUPLIKAT
    // ==========================================

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email,

          NOT: {
            id: currentUser.id,
          },
        },

        select: {
          id: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "Email tersebut sudah digunakan oleh user lain.",
        },
        {
          status: 409,
        },
      );
    }

    // ==========================================
    // 6. SIAPKAN AVATAR BARU
    // ==========================================

    let newAvatarPath =
      currentUser.avatar;

    let avatarWasUploaded = false;

    if (avatarValue instanceof File) {
      // File kosong tidak dianggap sebagai upload.
      if (avatarValue.size > 0) {
        // --------------------------------------
        // Validasi tipe file
        // --------------------------------------

        if (
          !Object.prototype.hasOwnProperty.call(
            allowedImageTypes,
            avatarValue.type,
          )
        ) {
          return NextResponse.json(
            {
              message:
                "Format avatar harus JPG, PNG, atau WEBP.",
            },
            {
              status: 400,
            },
          );
        }

        // --------------------------------------
        // Validasi ukuran file
        // --------------------------------------

        if (
          avatarValue.size >
          MAX_AVATAR_SIZE
        ) {
          return NextResponse.json(
            {
              message:
                "Ukuran avatar maksimal 5 MB.",
            },
            {
              status: 400,
            },
          );
        }

        // --------------------------------------
        // Tentukan extension
        // --------------------------------------

        const extension =
          allowedImageTypes[
            avatarValue.type as keyof typeof allowedImageTypes
          ];

        // --------------------------------------
        // Buat nama file
        // --------------------------------------

        const fileName =
          `user-${currentUser.id}-${Date.now()}.${extension}`;

        // --------------------------------------
        // Tentukan folder upload
        // --------------------------------------

        const uploadDirectory =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "avatars",
          );

        const filePath =
          path.join(
            uploadDirectory,
            fileName,
          );

        // --------------------------------------
        // Pastikan folder tersedia
        // --------------------------------------

        await fs.mkdir(
          uploadDirectory,
          {
            recursive: true,
          },
        );

        // --------------------------------------
        // Ambil isi file
        // --------------------------------------

        const arrayBuffer =
          await avatarValue.arrayBuffer();

        const buffer =
          Buffer.from(arrayBuffer);

        // --------------------------------------
        // Simpan file
        // --------------------------------------

        await fs.writeFile(
          filePath,
          buffer,
        );

        // --------------------------------------
        // Simpan URL avatar
        // --------------------------------------

        newAvatarPath =
          `/uploads/avatars/${fileName}`;

        avatarWasUploaded = true;
      }
    }

    // ==========================================
    // 7. UPDATE DATABASE
    // ==========================================

    try {
      const updatedUser =
        await prisma.user.update({
          where: {
            id: currentUser.id,
          },

          data: {
            name,
            email,
            avatar: newAvatarPath,
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        });

      // ========================================
      // 8. HAPUS AVATAR LAMA
      // ========================================

      // Hanya dilakukan jika memang ada
      // avatar baru.
      if (
        avatarWasUploaded &&
        currentUser.avatar &&
        currentUser.avatar !== newAvatarPath
      ) {
        await deleteOldAvatar(
          currentUser.avatar,
        );
      }

      // ========================================
      // 9. RESPONSE
      // ========================================

      return NextResponse.json(
        {
          message:
            "Profile berhasil diperbarui.",

          user: updatedUser,
        },
        {
          status: 200,
        },
      );
    } catch (error) {
      // ========================================
      // 10. ROLLBACK FILE JIKA DATABASE GAGAL
      // ========================================

      if (
        avatarWasUploaded &&
        newAvatarPath &&
        newAvatarPath !==
          currentUser.avatar
      ) {
        await deleteOldAvatar(
          newAvatarPath,
        );
      }

      throw error;
    }
  } catch (error) {
    console.error(
      "PROFILE_UPDATE_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat memperbarui profile.",
      },
      {
        status: 500,
      },
    );
  }
}