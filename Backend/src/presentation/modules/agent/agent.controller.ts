import { PersonController } from "../person/person.controller";
import { AgentService } from "./agent.service";
export class AgentController extends PersonController { constructor() { super("AGENTE", new AgentService()); } }