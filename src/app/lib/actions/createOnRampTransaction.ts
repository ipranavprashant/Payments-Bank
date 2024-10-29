"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
})

export async function createOnRampTransaction(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    const token = Math.random().toString();
    const userId = session.user.id;
    if (!userId) {
        return {
            message: "User not logged in"
        }
    }
    await db.onRampTransaction.create({
        data: {
            userId: Number(userId), // 1
            amount: amount,
            status: "Processing",
            startTime: new Date(),
            provider,
            token: token
        }
    })

    return {
        message: "On ramp transaction added"
    }
}