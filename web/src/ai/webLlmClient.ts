import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

export class WebLlmClient {
  private engine: MLCEngine | null = null;
  private modelId = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC';

  async initialize(onProgress?: (progress: number) => void) {
    if (this.engine) return;

    this.engine = await CreateMLCEngine(this.modelId, {
      initProgressCallback: (report) => {
        if (onProgress) onProgress(report.progress);
      },
    });
  }

  async generateGameLore(context: string): Promise<string> {
    if (!this.engine) throw new Error('AI Engine not initialized');

    const messages = [
      {
        role: 'system' as const,
        content: 'You are the AI Governor of Astro Colony Idle+. Provide short, futuristic updates or lore based on the colony state.',
      },
      { role: 'user' as const, content: context },
    ];

    const reply = await this.engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 100,
    });

    return reply.choices[0].message.content || 'Connection stable. No anomalies detected.';
  }

  async proposeJsonPatch(context: string): Promise<string> {
    if (!this.engine) throw new Error('AI Engine not initialized');

    const messages = [
      {
        role: 'system' as const,
        content: 'You create safe Astro Colony Idle+ evolution proposals. Output compact JSON only. Valid patch types are GALAXY_MESSAGE, ADD_TECHNOLOGY, ADD_BUILDING, UPDATE_RESOURCES. Never mention source-code changes.',
      },
      {
        role: 'user' as const,
        content: `Colony context: ${context}. Propose one balanced JSON patch under 500 characters.`,
      },
    ];

    const reply = await this.engine.chat.completions.create({
      messages,
      temperature: 0.4,
      max_tokens: 160,
    });

    return reply.choices[0].message.content || '{"type":"GALAXY_MESSAGE","payload":{"message":"Quiet stars. No evolution patch generated."}}';
  }
}

export const aiClient = new WebLlmClient();
