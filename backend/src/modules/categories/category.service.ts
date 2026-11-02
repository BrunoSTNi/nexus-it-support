import { prisma } from '../../config/prisma';

export class CategoryService {
  async create(name: string, description?: string) {
    const categoryExists = await prisma.category.findUnique({ where: { name } });
    if (categoryExists) throw new Error('Categoria já existe');

    return prisma.category.create({
      data: { name, description },
    });
  }

  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async update(id: string, name: string, description?: string, active?: boolean) {
    return prisma.category.update({
      where: { id },
      data: { name, description, active },
    });
  }
}