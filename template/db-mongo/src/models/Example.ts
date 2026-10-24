import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const ExampleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

export type ExampleDoc = InferSchemaType<typeof ExampleSchema>;

export const Example: Model<ExampleDoc> =
  (models.Example as Model<ExampleDoc> | undefined) ??
  model<ExampleDoc>("Example", ExampleSchema);
