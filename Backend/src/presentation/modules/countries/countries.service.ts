import { CustomError } from "../../../domain/errors/custom.error";
import { bodyRecord, locationName, positiveId } from "../locations/locations.shared";
import { CountriesModel, Country } from "./countries.model";

export class CountriesService {
  constructor(private readonly model = new CountriesModel()) {}

  getAll(): Promise<Country[]> {
    return this.model.getAll();
  }

  async getById(rawId: unknown): Promise<Country> {
    const country = await this.model.getById(positiveId(rawId, "El id del país"));
    if (!country) {
      throw CustomError.notFound("No se encontró el país solicitado.");
    }
    return country;
  }

  async create(body: unknown): Promise<Country> {
    const data = bodyRecord(body);
    return this.model.create(locationName(data.nombre, "El nombre del país"));
  }

  async update(rawId: unknown, body: unknown): Promise<Country> {
    const id = positiveId(rawId, "El id del país");
    const data = bodyRecord(body);
    const country = await this.model.update(
      id,
      locationName(data.nombre, "El nombre del país")
    );
    if (!country) {
      throw CustomError.notFound("No se encontró el país solicitado.");
    }
    return country;
  }

  async delete(rawId: unknown): Promise<void> {
    const id = positiveId(rawId, "El id del país");
    const result = await this.model.deleteIfUnused(id);
    if (result === "not-found") {
      throw CustomError.notFound("No se encontró el país solicitado.");
    }
    if (result === "in-use") {
      throw CustomError.conflict(
        "No se puede eliminar el país porque todavía tiene departamentos."
      );
    }
  }
}
