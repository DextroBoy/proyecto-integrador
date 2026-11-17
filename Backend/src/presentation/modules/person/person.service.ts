import bcrypt from "bcryptjs";
import { CustomError } from "../../../domain/errors/custom.error";
import { UserRole } from "../../../domain/interfaces/auth.interface";
import { AccountInput, PersonModel, PersonRecord } from "./person.model";

const MAX_POSTGRES_INTEGER = 2_147_483_647;

export class PersonService {
  constructor(private readonly model = new PersonModel()) {}
  getAll(role?: UserRole): Promise<PersonRecord[]> { return this.model.getAll(role); }
  async getById(id: unknown, role?: UserRole): Promise<PersonRecord> {
    const person = await this.model.getById(Number(id), role);
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1 || Number(id) > MAX_POSTGRES_INTEGER || !person) throw CustomError.notFound("No se encontró la cuenta solicitada.");
    return person;
  }
  async create(body: unknown, role: UserRole): Promise<PersonRecord> {
    this.validateRole(role);
    const data = this.input(body);
    try { return await this.model.create(data, role, await bcrypt.hash(data.password!, 12)); }
    catch (error) { if ((error as { code?: string }).code === "23505") throw CustomError.conflict("La identificación o el correo ya están registrados."); throw error; }
  }
  async update(id: unknown, body: unknown, role: UserRole): Promise<PersonRecord> {
    this.validateRole(role);
    const data = body as Partial<AccountInput>;
    const hash = typeof data.password === "string" && data.password ? await bcrypt.hash(data.password, 12) : undefined;
    const updateData = { ...data };
    delete updateData.password;
    const result = await this.model.update(Number(id), updateData, role, hash);
    if (!result) throw CustomError.notFound("No se encontró la cuenta solicitada.");
    return result;
  }
  async delete(id: unknown, role: UserRole): Promise<void> { this.validateRole(role); if (!await this.model.delete(Number(id), role)) throw CustomError.notFound("No se encontró la cuenta solicitada."); }
  private validateRole(role: UserRole): void { if (!['ADMIN', 'CLIENTE', 'AGENTE'].includes(role)) throw CustomError.badRequest("El rol no es válido."); }
  private input(body: unknown): AccountInput {
    const value = body as Record<string, unknown>;
    const input = { identificacion: Number(value.identificacion), nombre: value.nombre, direccion: value.direccion, email: value.email, password: value.password, id_ciudad: Number(value.id_ciudad) } as AccountInput;
    if (!Number.isSafeInteger(input.identificacion) || input.identificacion < 1 || input.identificacion > MAX_POSTGRES_INTEGER ||
      !Number.isSafeInteger(input.id_ciudad) || input.id_ciudad < 1 || input.id_ciudad > MAX_POSTGRES_INTEGER ||
      typeof input.nombre !== "string" || !input.nombre.trim() || typeof input.direccion !== "string" || !input.direccion.trim() ||
      typeof input.email !== "string" || !/^\S+@\S+\.\S+$/.test(input.email) || typeof input.password !== "string" || input.password.length < 6) throw CustomError.badRequest("Los datos de la cuenta no son válidos.");
    return { ...input, nombre: input.nombre.trim(), direccion: input.direccion.trim(), email: input.email.trim().toLowerCase() };
  }
}