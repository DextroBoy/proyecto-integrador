import { PersonService } from "../person/person.service";
import { ClientModel } from "./client.model";
export class ClientService extends PersonService { constructor() { super(new ClientModel()); } }