import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AnalyzeRepositoryDto {
  @IsString()
  @IsNotEmpty()
  repositoryPath: string;

  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  config?: any;
}
