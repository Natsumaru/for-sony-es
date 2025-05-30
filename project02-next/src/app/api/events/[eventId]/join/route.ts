import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type JoinEventRequest = {
    anonymousName?: string;
  };  

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth.protect();
  const body:JoinEventRequest = await request.json().catch(() => ({}));
  const anonymousName = body.anonymousName;

  const eventId = params.eventId;

  if (!eventId) {
    return NextResponse.json(
      { message: "Event ID is required" },
      { status: 400 }
    );
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!appUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  // すでに参加済みかチェック
  const existing = await prisma.participation.findUnique({
    where: {
      userId_eventId: {
        userId: appUser.id,
        eventId: eventId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Already joined this event" },
      { status: 409 }
    );
  }

  // 登録
  const participation = await prisma.participation.create({
    data: {
      userId: appUser.id,
      eventId: eventId,
      anonymousName:
        anonymousName && typeof anonymousName === "string"
          ? anonymousName
          : null,
    },
  });

  return NextResponse.json(
    { message: "Joined successfully", participation },
    { status: 201 }
  );
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { userId } = await auth.protect();
  const eventId = params.eventId;

  if (!eventId) {
    return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      following: true,
      followers: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      owner: true,
      tags: true,
    },
  });

  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const participations = await prisma.participation.findMany({
    where: { eventId },
    include: {
      user: true,
    },
  });

  const followingIds = new Set(currentUser.following.map(f => f.followingId));
  const followerIds = new Set(currentUser.followers.map(f => f.followerId));

  const isSelf = event.ownerId === currentUser.id;
  const isFollowed = followerIds.has(event.ownerId);
  const isFollowing = followingIds.has(event.ownerId);

  const canShowOwner =
    event.visibility === "PUBLIC" ||
    (event.visibility === "FOLLOWERS" && isFollowed) ||
    (event.visibility === "MUTUAL_FOLLOW" && isFollowed && isFollowing) ||
    isSelf;

  const ownerParticipation = participations.find(p => p.userId === event.ownerId);
  const owner = canShowOwner
    ? {
        id: event.owner.id,
        displayName: ownerParticipation?.anonymousName || event.owner.displayName,
        imageUrl: ownerParticipation?.anonymousName ? null : event.owner.imageUrl,
        isVerified: ownerParticipation?.anonymousName ? false : event.owner.isVerified,
      }
    : {
        id: event.owner.id,
        displayName: "匿名ユーザー",
        imageUrl: null,
        isVerified: false,
      };

  const participants = participations.map(p => ({
    id: p.user.id,
    displayName: p.anonymousName || p.user.displayName,
    imageUrl: p.anonymousName ? null : p.user.imageUrl,
    isVerified: p.anonymousName ? false : p.user.isVerified,
    isOwner: p.userId === event.ownerId,
  }));

  const hasJoined = participations.some(p => p.userId === currentUser.id);

  return NextResponse.json({
    event: {
      ...event,
      owner,
      participants,
      hasJoined,
    },
  });
}