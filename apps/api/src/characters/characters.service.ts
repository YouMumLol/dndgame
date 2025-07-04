import { Injectable } from '@nestjs/common';
import 'multer';
import { Express } from 'express';
import { CreateCharacterDto } from './dto/create-character.dto';
import { GroqService } from 'src/groq/groq.service';

@Injectable()
export class CharactersService {
  constructor(private readonly groqService: GroqService) {}

  async create(
    createCharacterDto: CreateCharacterDto,
    portrait: Express.Multer.File,
  ) {
    console.log('Character DTO:', createCharacterDto);
    console.log('Portrait File:', portrait);

    const description =
      await this.groqService.generateDescriptionFromImage(portrait);
    console.log('Generated Description:', description);

    return {
      message: 'Character data received successfully',
      data: createCharacterDto,
      file: {
        originalname: portrait.originalname,
        mimetype: portrait.mimetype,
        size: portrait.size,
      },
      description: description,
    };
  }
}
