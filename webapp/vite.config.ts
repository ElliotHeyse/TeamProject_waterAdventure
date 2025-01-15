import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import { Server } from 'socket.io';
import { prisma } from './src/lib/server/db';

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
							isFromParent: message.isFromParent
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
	plugins: [sveltekit(), webSocketServer],
	server: {
		port: 5173
	}
});
