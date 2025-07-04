import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { Express } from 'express';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('portrait'))
  create(
    @Body() createCharacterDto: CreateCharacterDto,
    @UploadedFile() portrait: Express.Multer.File,
  ) {
    return this.charactersService.create(createCharacterDto, portrait);
  }
}
