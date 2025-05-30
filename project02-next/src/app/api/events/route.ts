import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth.protect();

  const body = await request.json();
  const {
    title,
    description,
    imageUrl,
    location,
    price,
    scheduledAt,
    tagIds,
    visibility = "PUBLIC",
    anonymousName,
  } = body;

  if (!title || !location || !price || !scheduledAt) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  const appUser = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!appUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const existingTags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
  });
  if (existingTags.length !== tagIds.length) {
    return NextResponse.json(
      { message: "One or more tagIds are invalid" },
      { status: 400 }
    );
  }

  const newEvent = await prisma.event.create({
    data: {
      title,
      description,
      imageUrl,
      location,
      price,
      scheduledAt: new Date(scheduledAt),
      visibility,
      ownerId: appUser.id,
      tags: {
        connect: tagIds?.map((tagId: string) => ({ id: tagId })),
      },
    },
  });

  await prisma.participation.create({
    data: {
      userId: appUser.id,
      eventId: newEvent.id,
      anonymousName:
        anonymousName && typeof anonymousName === "string"
          ? anonymousName
          : null,
    },
  });
  return NextResponse.json(
    { message: "Event created", event: newEvent },
    { status: 201 }
  );
}

export async function GET() {
  const { userId } = await auth.protect();

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

  const events = await prisma.event.findMany({
    where: {
      scheduledAt: { gte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      owner: true,
      tags: true,
    },
  });

  const eventIds = events.map(e => e.id);

  const participationData = await prisma.participation.findMany({
    where: {
      eventId: { in: eventIds },
    },
  });

  const participationMap = new Map(
    participationData.map(p => [`${p.eventId}:${p.userId}`, p])
  );

  const followingIds = new Set(currentUser.following.map(f => f.followingId));
  const followerIds = new Set(currentUser.followers.map(f => f.followerId));

  const processedEvents = events.map(event => {
    const isSelf = event.ownerId === currentUser.id;
    const isFollowed = followerIds.has(event.ownerId);
    const isFollowing = followingIds.has(event.ownerId);

    const canShowOwner =
      event.visibility === "PUBLIC" ||
      (event.visibility === "FOLLOWERS" && isFollowed) ||
      (event.visibility === "MUTUAL_FOLLOW" && isFollowed && isFollowing) ||
      isSelf;

    const participation = participationMap.get(`${event.id}:${event.ownerId}`);

    const owner = canShowOwner
      ? {
          id: event.owner.id,
          displayName: participation?.anonymousName || event.owner.displayName,
          imageUrl: participation?.anonymousName ? null : event.owner.imageUrl,
          isVerified: participation?.anonymousName ? false : event.owner.isVerified,
        }
      : {
          id: event.owner.id,
          displayName: "匿名ユーザー",
          imageUrl: null,
          isVerified: false,
        };

    return {
      ...event,
      owner,
    };
  });

  return NextResponse.json({ events: processedEvents }, { status: 200 });
}
