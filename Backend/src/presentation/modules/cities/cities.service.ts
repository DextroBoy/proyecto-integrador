import { CustomError } from "../../../domain/errors/custom.error";
import {
  bodyRecord,
  locationName,
  positiveId,
} from "../locations/locations.shared";
import { DepartmentsModel } from "../departments/departments.model";
import { CitiesModel, City } from "./cities.model";

export class CitiesService {
  constructor(
    private readonly model = new CitiesModel(),
    private readonly departments = new DepartmentsModel()
  ) {}

  async getAll(rawDepartmentId: unknown): Promise<City[]> {
    if (rawDepartmentId === undefined) {
      return this.model.getAll();
    }
    return this.model.getAll(
      positiveId(rawDepartmentId, "El id del departamento")
    );
  }

  async getById(rawId: unknown): Promise<City> {
    const city = await this.model.getById(positiveId(rawId, "El id de la ciudad"));
    if (!city) {
      throw CustomError.notFound("No se encontró la ciudad solicitada.");
    }
    return city;
  }

  async create(body: unknown): Promise<City> {
    const data = bodyRecord(body);
    const departmentId = positiveId(data.id_departamento, "El id del departamento");
    await this.assertDepartmentExists(departmentId);
    return this.model.create(
      departmentId,
      locationName(data.nombre, "El nombre de la ciudad")
    );
  }

  async update(rawId: unknown, body: unknown): Promise<City> {
    const id = positiveId(rawId, "El id de la ciudad");
    const data = bodyRecord(body);
    const departmentId = positiveId(data.id_departamento, "El id del departamento");
    await this.assertDepartmentExists(departmentId);
    const city = await this.model.update(
      id,
      departmentId,
      locationName(data.nombre, "El nombre de la ciudad")
    );
    if (!city) {
      throw CustomError.notFound("No se encontró la ciudad solicitada.");
    }
    return city;
  }

  async delete(rawId: unknown): Promise<void> {
    const id = positiveId(rawId, "El id de la ciudad");
    const result = await this.model.deleteIfUnused(id);
    if (result === "not-found") {
      throw CustomError.notFound("No se encontró la ciudad solicitada.");
    }
    if (result === "in-use") {
      throw CustomError.conflict(
        "No se puede eliminar la ciudad porque tiene personas o eventos asociados."
      );
    }
  }

  private async assertDepartmentExists(id: number): Promise<void> {
    if (!(await this.departments.getById(id))) {
      throw CustomError.notFound("No se encontró el departamento indicado.");
    }
  }
}
