import { prisma } from '../../config/prisma';
import { Status, Priority } from '@prisma/client';

export class TicketService {
  async create(title: string, description: string, categoryId: string, requesterId: string) {
    return prisma.ticket.create({
      data: {
        title,
        description,
        categoryId,
        requesterId,
      },
    });
  }

  async findAll() {
    return prisma.ticket.findMany({
      include: {
        category: { select: { name: true } },
        requester: { select: { name: true, email: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addInteraction(ticketId: string, authorId: string, message: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error('Chamado não encontrado');

    return prisma.interaction.create({
      data: {
        message,
        ticketId,
        authorId,
      },
      include: {
        author: { select: { name: true, role: true } }
      }
    });
  }
}