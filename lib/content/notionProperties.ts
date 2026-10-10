/** Notion display-name capitalisation may change without changing the field. */
export function getNotionProperty(properties: Record<string, unknown>, name: string): unknown {
  if (Object.hasOwn(properties, name)) return properties[name]
  const match = Object.keys(properties).find(key => key.toLowerCase() === name.toLowerCase())
  return match ? properties[match] : undefined
}
