import { paraglide } from '@inlang/paraglide-sveltekit/vite'
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import { Server } from 'socket.io';
import { prisma } from './src/lib/server/db';
import webpush from 'web-push';

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

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

					if (
						process.env.VAPID_EMAIL &&
						process.env.VAPID_PUBLIC_KEY &&
						process.env.VAPID_PRIVATE_KEY &&
						savedMessage.sender === 'PARENT'
					) {
						const subscriptions = await prisma.pushSubscription.findMany({
							where: {
								userId: savedMessage.coach.user.id
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
								// If subscription is invalid, remove it from the database
								console.error('Error sending notification:', error);
							}
						}
					}

					// Broadcast message to all clients
					io.emit('message', savedMessage);
				} catch (error) {
					console.error('Error saving message:', error);
					socket.emit('error', 'Failed to save message');
				}
			});

			socket.on('disconnect', () => {
				console.log('Client disconnected');
			});
		});
	}
};

export default defineConfig({
	plugins: [paraglide({ project: './project.inlang', outdir: './src/lib/paraglide' }),sveltekit(), webSocketServer],
	server: {
		port: 5173
	}
});
