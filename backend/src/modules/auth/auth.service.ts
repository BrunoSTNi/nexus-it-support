import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';

export class AuthService {
  async register(name: string, email: string, password: string, role?: any) {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) throw new Error('Email já está em uso');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'USER' },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciais inválidas');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Credenciais inválidas');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return { user: { id: user.id, name: user.name, role: user.role }, token };
  }
}