import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function load({ params }) {
	const [parent, coaches] = await Promise.all([
		prisma.parent.findUnique({
			where: { id: params.id },
			include: {
				user: true,
				Coach: {
					include: {
						user: true
					}
				}
			}
		}),
		prisma.coach.findMany({
			include: {
				user: true
			}
		})
	]);

	if (!parent) {
		throw error(404, 'Parent not found');
	}

	return { parent, coaches };
}

export const actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const phone = formData.get('phone')?.toString() || null;
		const coachId = formData.get('coachId')?.toString() || null;

		if (!name || !email) {
			return {
				error: 'Name and email are required'
			};
		}

		const parent = await prisma.parent.findUnique({
			where: { id: params.id },
			include: { user: true }
		});

		if (!parent) {
			throw error(404, 'Parent not found');
		}

		await prisma.$transaction([
			prisma.user.update({
				where: { id: parent.userId },
				data: {
					name,
					email
				}
			}),
			prisma.parent.update({
				where: { id: params.id },
				data: {
					phone,
					coachId
				}
			})
		]);

		return {
			type: 'success'
		};
	}
}; 