// src/stories/dto/create-story.dto.ts
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateStoryDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;
}
