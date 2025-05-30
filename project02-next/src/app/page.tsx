"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import EventCard from "@/components/EventCard";

export default function Page() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/users/init", { method: "POST" })
        .then(async (res) => {
          const data = await res.json();
          console.log("User init result:", data.message);
        })
        .catch((err) => console.error("User init error:", err));
    }
  }, [isSignedIn]);

  return (
   <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Event Manager</h1>
      <p className="text-lg mb-8">Manage your events easily!</p>
      <EventCard event={
        {
          id: "1",
          title: "Sample Event",
          description: "This is a sample event description. This is for testing purposes.",
          imageUrl: "https://via.placeholder.com/150",
          location: "Tokyo, Japan",
          price: 1000,
          scheduledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: "1",
          tags: [
            { id: "1", name: "あああああああああああああああんsふぁcもうぃも", color: "#FF5733" ,createdAt: new Date()},
            { id: "2", name: "Tag2", color: "#BB2039", createdAt: new Date()},
            { id: "3", name: "Tag3", color: "#BB2039", createdAt: new Date()},
            { id: "4", name: "Tag2", color: "#BB2039", createdAt: new Date()},
            { id: "5", name: "Tag3", color: "#BB2039", createdAt: new Date()},
            { id: "6", name: "Tag2", color: "#BB2039", createdAt: new Date()},
            { id: "7", name: "Tag3", color: "#BB2039", createdAt: new Date()},
            { id: "8", name: "Tag2", color: "#BB2039", createdAt: new Date()},
            { id: "9", name: "Tag3", color: "#BB2039", createdAt: new Date()},
          ],
          owner: {
            id: "1",
            displayName: "John Doe",
            imageUrl: "https://via.placeholder.com/50",
            isVerified: true,
            createdAt: new Date(),
            clerkUserId: "clerk123",
            bio: "Event enthusiast and organizer",
          },
        }
      }/>
    </div>
  )
  
}
