import { Document, Schema, model, Model } from 'mongoose';

interface IRaceResult extends Document {
  raceName: string;
  year: number;
  driver: string;
  team: string;
  laps: number;
  time: string;
  point: number;
  pos: number;
  no: number;
}

class RaceResultSchema {
  private static schema: Schema = new Schema<IRaceResult>({
    raceName: String,
    year: Number,
    driver: String,
    team: String,
    laps: Number,
    time: String,
    point: Number,
    pos: Number,
    no: Number
  });

  public static getModel(): Model<IRaceResult> {
    return model<IRaceResult>('RaceResult', this.schema);
  }
}

export default RaceResultSchema;
