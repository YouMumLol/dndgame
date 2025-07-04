import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class GroqService {
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly apiKey = process.env.GROQ_API_KEY;
  private readonly model = 'meta-llama/llama-4-maverick-17b-128e-instruct';

  constructor(private readonly httpService: HttpService) {}

  async generateDescriptionFromImage(
    image: Express.Multer.File,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not set.');
    }

    const base64Image = image.buffer.toString('base64');
    const imageUrl = `data:${image.mimetype};base64,${base64Image}`;

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe the character in this image in detail. Be precise and do not invent any details that are not present in the drawing.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          'Error calling Groq API:',
          error.response?.data || error.message,
        );
      } else {
        console.error('An unexpected error occurred:', error);
      }
      throw new Error('Failed to generate description from image.');
    }
  }
}
