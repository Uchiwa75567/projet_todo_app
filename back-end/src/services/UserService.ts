import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";

export class UserService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  async register(name: string, email: string, password: string) {
    const exists = await this.repo.findByEmail(email);
    if (exists) throw new Error("Email déjà utilisé");

    const hash = await bcrypt.hash(password, 10);
    const user = await this.repo.create({ name, email, password: hash });
    const token = this.signToken(user.id, user.email, user.name);

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new Error("Identifiants invalides");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error("Identifiants invalides");

    const token = this.signToken(user.id, user.email, user.name);
    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  private signToken(id: number, email: string, name?: string) {
    return jwt.sign({ id, email, name }, process.env.JWT_SECRET as string, {
      expiresIn: "2h",
    });
  }
}
