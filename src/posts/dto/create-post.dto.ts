import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  ValidateIf,
} from 'class-validator';

export class CreatePostDto {
  // ----------- TEXTE -----------
  @IsNotEmpty({ message: 'Le contenu est obligatoire' })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  content: string;

  // ----------- MEDIA URL -----------
  @ValidateIf((o) => o.mediaType !== undefined)
  @IsString({ message: 'mediaUrl doit être une chaîne valide' })
  mediaUrl?: string;

  // ----------- MEDIA TYPE -----------
  @ValidateIf((o) => o.mediaUrl !== undefined)
  @IsIn(['image', 'video'], {
    message: 'mediaType doit être "image" ou "video"',
  })
  mediaType?: 'image' | 'video';
}
