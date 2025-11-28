// Image handling - convert to base64 for OpenAI vision
export async function imageToBase64(buffer: Buffer, mimeType: string): Promise<string> {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}
