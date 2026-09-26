import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";

export const dynamic = "force-dynamic";

const ONLINE_THRESHOLD_SECONDS = 60;

/* GET - Mengambil daftar user yang sedang online */
export async function GET() {
  try {
    // Pastikan user sudah login
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // User dianggap online jika
    // lastSeen masih dalam 60 detik terakhir.
    const onlineSince = new Date(
      Date.now() -
        ONLINE_THRESHOLD_SECONDS * 1000,
    );

    // Ambil user online
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        lastSeen: {
          gte: onlineSince,
        },
      },

      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
        lastSeen: true,
      },

      orderBy: {
        lastSeen: "desc",
      },
    });

    return NextResponse.json(
      {
        users,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "GET_ONLINE_USERS_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal mengambil data user online.",
      },
      {
        status: 500,
      },
    );
  }
}

/*POST - Memperbarui LastSeen user yang sedang login */
export async function POST() {
  try {
    // Ambil session user
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // Update lastSeen
    const updatedUser =
      await prisma.user.update({
        where: {
          id: session.userId,
        },

        data: {
          lastSeen: new Date(),
        },

        select: {
          id: true,
          name: true,
          role: true,
          lastSeen: true,
        },
      });

    return NextResponse.json(
      {
        message: "Heartbeat berhasil.",
        user: updatedUser,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "ONLINE_HEARTBEAT_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal memperbarui status online.",
      },
      {
        status: 500,
      },
    );
  }
}