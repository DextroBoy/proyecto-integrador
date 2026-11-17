import { PersonController } from "../person/person.controller";
import { ClientService } from "./client.service";
export class ClientController extends PersonController { constructor() { super("CLIENTE", new ClientService()); } }