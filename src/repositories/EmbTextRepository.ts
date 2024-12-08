import { EmbTextData } from "../types/embText";
import { BaseRepository } from "./BaseRepository";

export class EmbTextRepository extends BaseRepository<EmbTextData> {
  constructor(database: any) {
    super(database, 'embTextCollection');
  }
}
