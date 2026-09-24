import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/src/lib/prisma";
import { createSession } from "@/src/lib/session";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, {
      message: "Email wajib diisi.",
    })
    .toLowerCase()
    .email({
      message: "Format email tidak valid.",
    }),

  password: z
    .string()
    .min(1, {
      message: "Password wajib diisi.",
    }),
});

export async function POST(request: Request) {
  try {

    const body = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Data login tidak valid.",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Email atau password salah.",
        },
        {
          status: 401,
        }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          message: "Akun tidak aktif. Silakan hubungi administrator.",
        },
        {
          status: 403,
        }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Email atau password salah.",
        },
        {
          status: 401,
        }
      );
    }

    await createSession({
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: "Login berhasil.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}

