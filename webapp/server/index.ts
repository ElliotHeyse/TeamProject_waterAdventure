import express from 'express';
import { handler } from '../build/handler.js'
import { Server } from 'socket.io';
import { createServer } from 'http';
import { prisma } from '../src/lib/server/db.js';
import webpush from 'web-push';
import { $ } from "bun";

// Ensure build directory exists
await $`mkdir -p build/client/src/lib`;

// Copy static assets
try {
    await $`cp -r src/lib/img build/client/src/lib/`;
    await $`cp -r src/lib/beeldmateriaalZwemfed build/client/src/lib/`;
} catch (error) {
    console.warn('Warning: Some assets might not exist:', error);
}

async function main() {
    const app = express();
    const server = createServer(app);

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('message', async (message) => {
            try {
                const savedMessage = await prisma.message.create({
                    data: {
                        content: message.content,
                        coachId: message.coachId,
                        parentId: message.parentId,
                        sender: message.isFromParent ? 'PARENT' : 'COACH'
                    },
                    include: {
                        coach: {
                            include: {
                                user: true
                            }
                        },
                        parent: {
                            include: {
                                user: true
                            }
                        }
                    }
                });

                if (process.env.VAPID_EMAIL && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
                    let subscriptions = await prisma.pushSubscription.findMany({
                        where: {
                            userId: savedMessage.sender === 'PARENT' ? savedMessage.coach.user.id : savedMessage.parentId
                        }
                    });

                    for (const subscription of subscriptions) {
                        try {
                            webpush.setVapidDetails(
                                `mailto:${process.env.VAPID_EMAIL}`,
                                process.env.VAPID_PUBLIC_KEY,
                                process.env.VAPID_PRIVATE_KEY
                            );

                            await webpush.sendNotification(
                                {
                                    endpoint: subscription.endpoint,
                                    keys: {
                                        p256dh: subscription.p256dh,
                                        auth: subscription.auth
                                    }
                                },
                                JSON.stringify({
                                    title: `New message from ${savedMessage.parent.user.name}`,
                                    body: savedMessage.content,
                                    url: `${process.env.APP_URL}/app/chat/${savedMessage.parentId}`
                                })
                            );
                        } catch (error) {
                            console.error('Error sending notification:', error);
                        }
                    }
                }

                // Create a unique room name for this conversation
                const roomName = `chat_${savedMessage.coachId}_${savedMessage.parentId}`;

                // Emit the message only to clients in this room
                io.to(roomName).emit('message', savedMessage);
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', 'Failed to save message');
            }
        });

        socket.on('join_chat', ({ coachId, parentId }) => {
            if (!coachId || !parentId) return;

            // Create a unique room name for this conversation
            const roomName = `chat_${coachId}_${parentId}`;

            // Join the room
            socket.join(roomName);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    app.use(handler);

    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main().catch(console.error);