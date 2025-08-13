import { TaskDTO } from "./task.dto";


export interface ProjectsDTO {
  _id: string;
  projectName: string;
  clientName: string;
  description: string;
  manager: string;
  tasks: TaskDTO[];
}