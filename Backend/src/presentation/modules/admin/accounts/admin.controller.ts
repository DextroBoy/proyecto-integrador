import { PersonController } from "../../person/person.controller";
import { AdminService } from "./admin.service";
export class AdminController extends PersonController { constructor() { super("ADMIN", new AdminService()); } }