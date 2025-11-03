import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GenerateCodeDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  config?: any;
}
