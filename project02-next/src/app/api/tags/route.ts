// app/api/tags/route.ts

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth.protect();

  const body = await req.json();
  const { name, color } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ message: "Invalid tag name" }, { status: 400 });
  }

  // カラーコードが正しいかも確認する
  if (!color || typeof color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return NextResponse.json({ message: "Invalid tag color" }, { status: 400 });
  }

  try {
    const tag = await prisma.tag.create({ data: { name,color } });
    return NextResponse.json({ tag }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Tag already exists" },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth.protect();
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({ tags }, { status: 200 });
}
