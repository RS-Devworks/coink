import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10 * 1024 * 1024) // 10MB limit for base64 string
  photoBase64: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class DeletePhotoDto {
  @IsOptional()
  @IsString()
  sessionId?: string;
}
