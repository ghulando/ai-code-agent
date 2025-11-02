import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyzeRepositoryService } from '../../application/services/analyze-repository.service';
import { AnalyzeRepositoryDto } from '../../application/dto/analyze-repository.dto';

@Controller()
export class RepositoryController {
  constructor(private readonly analyzeRepositoryService: AnalyzeRepositoryService) {}

  @Post('analyze-repo')
  @HttpCode(HttpStatus.OK)
  async analyzeRepository(@Body() dto: AnalyzeRepositoryDto) {
    const result = await this.analyzeRepositoryService.execute(
      dto.repositoryPath,
      dto.query,
      dto.config,
    );

    return {
      success: true,
      data: result,
    };
  }
}
