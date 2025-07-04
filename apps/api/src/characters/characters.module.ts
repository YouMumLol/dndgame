import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { GroqModule } from 'src/groq/groq.module';

@Module({
  imports: [GroqModule],
  controllers: [CharactersController],
  providers: [CharactersService],
})
export class CharactersModule {}
