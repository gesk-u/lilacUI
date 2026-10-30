import { Schema, model, type InferSchemaType } from 'mongoose';

/*
 * One generated style per distinct prompt. Saving them lets a repeated prompt skip the AI
 * (faster, and it saves free-tier quota) and lets the site show recent creations.
 */
const styleDocSchema = new Schema(
  {
    /* Lower-cased, whitespace-collapsed prompt: "Cheese  Button" and "cheese button" match */
    promptKey: { type: String, required: true, unique: true, maxlength: 300 },
    prompt: { type: String, required: true, maxlength: 300 },
    style: { type: Schema.Types.Mixed, required: true },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    /* How many times this prompt was asked for, including the first */
    hits: { type: Number, default: 1 },
  },
  { timestamps: true },
);

styleDocSchema.index({ createdAt: -1 });

export type StyleDoc = InferSchemaType<typeof styleDocSchema>;
export const StyleModel = model('Style', styleDocSchema);

export function toPromptKey(prompt: string) {
  return prompt.trim().toLowerCase().replace(/\s+/g, ' ');
}
