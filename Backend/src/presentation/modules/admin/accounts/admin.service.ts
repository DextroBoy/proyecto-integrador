import { PersonService } from "../../person/person.service";
import { AdminModel } from "./admin.model";
export class AdminService extends PersonService { constructor() { super(new AdminModel()); } }