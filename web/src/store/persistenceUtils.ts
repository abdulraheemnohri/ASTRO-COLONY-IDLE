export async function compressState(state: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(state);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    }
  });
  const compressionStream = new CompressionStream('gzip');
  const compressedStream = stream.pipeThrough(compressionStream);
  const response = new Response(compressedStream);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function decompressState(compressed: Uint8Array): Promise<string> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(compressed);
      controller.close();
    }
  });
  const decompressionStream = new DecompressionStream('gzip');
  const decompressedStream = stream.pipeThrough(decompressionStream);
  const response = new Response(decompressedStream);
  const blob = await response.blob();
  return await blob.text();
}
