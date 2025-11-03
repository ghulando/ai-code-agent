import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerateCodeService } from '../../application/services/generate-code.service';
import { GenerateCodeDto } from '../../application/dto/generate-code.dto';

@Controller()
export class CodeGenerationController {
  constructor(private readonly generateCodeService: GenerateCodeService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateCode(@Body() dto: GenerateCodeDto) {
    const result = await this.generateCodeService.execute(dto.prompt, dto.config);

    return {
      success: true,
      data: {
        response: result.response,
        executionTime: result.executionTime,
        model: result.model,
      },
    };
  }
}
