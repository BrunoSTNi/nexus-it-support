import { prisma } from '../../config/prisma';
import { Status, Priority } from '@prisma/client';
import { AIService } from '../ai/ai.service';

export class TicketService {
  async create(description: string, requesterId: string) {
    // 1. Chama a IA estaticamente
    const aiAnalysis = await AIService.classifyTicket(description);

    const categoryName = aiAnalysis.category;
    const title = aiAnalysis.title;
    const priority = (aiAnalysis.priority as Priority) || Priority.MEDIUM;

    // 2. Busca ou cria a categoria no banco
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName },
      });
    }

    // 3. Salva o ticket com os dados inteligentes
    return prisma.ticket.create({
      data: {
        title,
        description,
        status: Status.OPEN,
        priority,
        categoryId: category.id,
        requesterId,
      },
      include: {
        category: { select: { name: true } },
        requester: { select: { name: true, email: true } },
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