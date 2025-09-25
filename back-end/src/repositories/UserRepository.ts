import prisma from "../utils/prismaClient.js";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string; // hashé
}

export class UserRepository {
  async create(data: CreateUserDTO) {
    return prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
}
