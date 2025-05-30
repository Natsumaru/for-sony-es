import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ChatMessageRequest = {
  content: string;
};

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth.protect();
  const eventId = params.eventId;
  const body: ChatMessageRequest = await request.json().catch(() => ({}));
  const { content } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ message: "Content is required" }, { status: 400 });
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!appUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // 参加していないユーザーは投稿不可
  const participation = await prisma.participation.findUnique({
    where: {
      userId_eventId: {
        userId: appUser.id,
        eventId,
      },
    },
  });

  if (!participation) {
    return NextResponse.json({ message: "You are not a participant" }, { status: 403 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      eventId,
      senderId: appUser.id,
      content,
    },
  });

  return NextResponse.json({ message: "Message sent", data: message }, { status: 201 });
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth.protect();
  const eventId = params.eventId;

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!appUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const isParticipant = await prisma.participation.findUnique({
    where: {
      userId_eventId: {
        userId: appUser.id,
        eventId,
      },
    },
  });

  if (!isParticipant) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: true,
    },
  });

  const participants = await prisma.participation.findMany({
    where: { eventId },
  });

  const anonymousNameMap = new Map(
    participants.map(p => [`${p.userId}`, p.anonymousName])
  );

  const formattedMessages = messages.map(msg => {
    const anon = anonymousNameMap.get(msg.senderId);
    return {
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        displayName: anon || msg.sender.displayName,
        imageUrl: anon ? null : msg.sender.imageUrl,
        isVerified: anon ? false : msg.sender.isVerified,
      },
    };
  });

  return NextResponse.json({ messages: formattedMessages }, { status: 200 });
}
