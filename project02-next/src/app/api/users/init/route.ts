import {auth,currentUser} from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(){
    const {userId} = await auth.protect()
    const existing = await prisma.user.findUnique({
        where:{
            clerkUserId:userId
        }
    })
    if(existing){
        return NextResponse.json({message:"User already exists"}, {status:200})
    }
    const user = await currentUser()
    if(!user){
        return NextResponse.json({message:"Failed to fetch user"}, {status:500})
    }

    await prisma.user.create({
        data:{
            clerkUserId:user.id,
            displayName:user.username || user.firstName || "User",
            imageUrl:user.imageUrl,
        }});
    return NextResponse.json({message:"User created"}, {status:201})
}
