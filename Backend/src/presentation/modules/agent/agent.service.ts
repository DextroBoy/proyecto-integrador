import { PersonService } from "../person/person.service";
import { AgentModel } from "./agent.model";
export class AgentService extends PersonService { constructor() { super(new AgentModel()); } }