import { CustomError } from "../../../domain/errors/custom.error";
import {
  bodyRecord,
  locationName,
  positiveId,
} from "../locations/locations.shared";
import { Department, DepartmentsModel } from "./departments.model";
import { CountriesModel } from "../countries/countries.model";

export class DepartmentsService {
  constructor(
    private readonly model = new DepartmentsModel(),
    private readonly countries = new CountriesModel()
  ) {}

  async getAll(rawCountryId: unknown): Promise<Department[]> {
    if (rawCountryId === undefined) {
      return this.model.getAll();
    }
    return this.model.getAll(positiveId(rawCountryId, "El id del país"));
  }

  async getById(rawId: unknown): Promise<Department> {
    const department = await this.model.getById(
      positiveId(rawId, "El id del departamento")
    );
    if (!department) {
      throw CustomError.notFound("No se encontró el departamento solicitado.");
    }
    return department;
  }

  async create(body: unknown): Promise<Department> {
    const data = bodyRecord(body);
    const countryId = positiveId(data.id_pais, "El id del país");
    await this.assertCountryExists(countryId);
    return this.model.create(
      countryId,
      locationName(data.nombre, "El nombre del departamento")
    );
  }

  async update(rawId: unknown, body: unknown): Promise<Department> {
    const id = positiveId(rawId, "El id del departamento");
    const data = bodyRecord(body);
    const countryId = positiveId(data.id_pais, "El id del país");
    await this.assertCountryExists(countryId);
    const department = await this.model.update(
      id,
      countryId,
      locationName(data.nombre, "El nombre del departamento")
    );
    if (!department) {
      throw CustomError.notFound("No se encontró el departamento solicitado.");
    }
    return department;
  }

  async delete(rawId: unknown): Promise<void> {
    const id = positiveId(rawId, "El id del departamento");
    const result = await this.model.deleteIfUnused(id);
    if (result === "not-found") {
      throw CustomError.notFound("No se encontró el departamento solicitado.");
    }
    if (result === "in-use") {
      throw CustomError.conflict(
        "No se puede eliminar el departamento porque todavía tiene ciudades."
      );
    }
  }

  private async assertCountryExists(id: number): Promise<void> {
    if (!(await this.countries.getById(id))) {
      throw CustomError.notFound("No se encontró el país indicado.");
    }
  }
}
