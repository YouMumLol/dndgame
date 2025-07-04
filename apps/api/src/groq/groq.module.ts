import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GroqService } from './groq.service';

@Module({
  imports: [HttpModule],
  providers: [GroqService],
  exports: [GroqService],
})
export class GroqModule {}
