import { type z, ZodEffects } from "zod";

/**
 * Unwraps ZodEffects (from preprocess/transform/refine) to get the inner schema.
 */
function unwrapEffects(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof ZodEffects) {
    return unwrapEffects(schema.innerType());
  }
  return schema;
}

/**
 * Introspects a Zod object schema and returns a Set of field names
 * that are required (not optional and not nullable).
 */
export function getRequiredFields(
  schema: z.ZodObject<z.ZodRawShape>,
): Set<string> {
  const required = new Set<string>();
  const shape = schema.shape;

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const zodField = unwrapEffects(fieldSchema as z.ZodTypeAny);
    if (!zodField.isOptional() && !zodField.isNullable()) {
      required.add(key);
    }
  }

  return required;
}
