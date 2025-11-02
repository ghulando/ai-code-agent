# NestJS Migration Plan - Code Agent

## Overview

This document outlines the step-by-step migration plan for converting the current Express-based Code Agent to NestJS while maintaining the clean architecture principles and existing functionality.

## Migration Strategy

**Approach**: Incremental migration with parallel development
**Timeline**: 2-3 weeks (depending on team size and availability)
**Risk Level**: Low (due to existing clean architecture)

---

## Phase 1: Project Setup & Foundation (Days 1-2)

### Step 1.1: Initialize NestJS Project Structure

```bash
# Create new NestJS project alongside current one
nest new code-agent-nestjs
cd code-agent-nestjs

# Install required dependencies
npm install --save @nestjs/common @nestjs/core @nestjs/platform-express
npm install --save class-validator class-transformer
npm install --save helmet cors express-rate-limit
npm install --save-dev @types/express
```

### Step 1.2: Project Structure Setup

Create the following directory structure:
```
src/
├── main.ts                           # Application entry point
├── app.module.ts                     # Root module
├── config/                           # Configuration
│   ├── config.module.ts
│   └── app.config.ts
├── domain/                           # Domain layer (copy from existing)
│   ├── entities/
│   └── errors/
├── application/                      # Application services
│   ├── services/
│   └── dto/
├── infrastructure/                   # Infrastructure layer
│   ├── codex/
│   ├── validation/
│   └── formatters/
└── presentation/                     # Presentation layer
    ├── controllers/
    ├── guards/
    ├── interceptors/
    ├── filters/
    └── dto/
```

### Step 1.3: Copy Domain Layer (No Changes Needed)

```bash
# Copy domain entities and errors as-is
cp -r ../ai-code-agent/src/domain ./src/
```

**Note**: Domain layer remains unchanged - this is the beauty of clean architecture!

---

## Phase 2: Core Module Setup (Days 3-4)

### Step 2.1: Create Configuration Module

**File**: `src/config/app.config.ts`

```typescript

export interface AppConfig {
  port: number;
  nodeEnv: string;
  openai: {
    apiKey: string;
  };
}

export const appConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
});
```

**File**: `src/config/config.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {}
```

### Step 2.2: Create Application Module Structure

**File**: `src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { CodeGenerationModule } from './presentation/controllers/code-generation.module';
import { RepositoryModule } from './presentation/controllers/repository.module';
import { HealthModule } from './presentation/controllers/health.module';

@Module({
  imports: [
    AppConfigModule,
    CodeGenerationModule,
    RepositoryModule,
    HealthModule,
  ],
})
export class AppModule {}
```

---

## Phase 3: Infrastructure Layer Migration (Days 5-6)

### Step 3.1: Convert Infrastructure Services to Providers

**File**: `src/infrastructure/codex/codex-cli.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
// Import existing CodexCLIService logic

@Injectable()
export class CodexCliService {
  // Migrate existing CodexCLIService methods
  // Add @Injectable() decorator
  // Keep all existing business logic
}
```

**File**: `src/infrastructure/validation/path-validator.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class PathValidatorService {
  // Migrate existing PathValidatorService logic
}
```

**File**: `src/infrastructure/formatters/response-formatter.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseFormatterService {
  // Migrate existing ResponseFormatterService logic
}
```

### Step 3.2: Create Infrastructure Module

**File**: `src/infrastructure/infrastructure.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { CodexCliService } from './codex/codex-cli.service';
import { PathValidatorService } from './validation/path-validator.service';
import { ResponseFormatterService } from './formatters/response-formatter.service';

@Module({
  providers: [
    CodexCliService,
    PathValidatorService,
    ResponseFormatterService,
  ],
  exports: [
    CodexCliService,
    PathValidatorService,
    ResponseFormatterService,
  ],
})
export class InfrastructureModule {}
```

---

## Phase 4: Application Layer Migration (Days 7-8)

### Step 4.1: Convert Use Cases to Services

**File**: `src/application/services/generate-code.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { CodexCliService } from '../../infrastructure/codex/codex-cli.service';
// Import domain entities and existing use case logic

@Injectable()
export class GenerateCodeService {
  constructor(private readonly codexService: CodexCliService) {}
  
  // Migrate existing GenerateCode use case logic
  async execute(prompt: string, config?: any) {
    // Keep existing business logic
  }
}
```

**File**: `src/application/services/analyze-repository.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { CodexCliService } from '../../infrastructure/codex/codex-cli.service';
import { PathValidatorService } from '../../infrastructure/validation/path-validator.service';
import { ResponseFormatterService } from '../../infrastructure/formatters/response-formatter.service';

@Injectable()
export class AnalyzeRepositoryService {
  constructor(
    private readonly codexService: CodexCliService,
    private readonly pathValidator: PathValidatorService,
    private readonly responseFormatter: ResponseFormatterService,
  ) {}
  
  // Migrate existing AnalyzeRepository use case logic
}
```

### Step 4.2: Create DTOs for Request/Response

**File**: `src/application/dto/generate-code.dto.ts`
```typescript
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GenerateCodeDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  config?: any;
}
```

**File**: `src/application/dto/analyze-repository.dto.ts`
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

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
```

### Step 4.3: Create Application Module

**File**: `src/application/application.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { GenerateCodeService } from './services/generate-code.service';
import { AnalyzeRepositoryService } from './services/analyze-repository.service';
import { CheckHealthService } from './services/check-health.service';

@Module({
  imports: [InfrastructureModule],
  providers: [
    GenerateCodeService,
    AnalyzeRepositoryService,
    CheckHealthService,
  ],
  exports: [
    GenerateCodeService,
    AnalyzeRepositoryService,
    CheckHealthService,
  ],
})
export class ApplicationModule {}
```

---

## Phase 5: Presentation Layer Migration (Days 9-10)

### Step 5.1: Convert Controllers

**File**: `src/presentation/controllers/code-generation.controller.ts`
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerateCodeService } from '../../application/services/generate-code.service';
import { GenerateCodeDto } from '../../application/dto/generate-code.dto';

@Controller()
export class CodeGenerationController {
  constructor(
    private readonly generateCodeService: GenerateCodeService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateCode(@Body() dto: GenerateCodeDto) {
    try {
      const result = await this.generateCodeService.execute(dto.prompt, dto.config);
      
      return {
        success: true,
        data: {
          response: result.response,
          executionTime: result.executionTime,
          model: result.model,
        },
      };
    } catch (error) {
      // Error handling will be done by exception filters
      throw error;
    }
  }
}
```

**File**: `src/presentation/controllers/repository.controller.ts`
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyzeRepositoryService } from '../../application/services/analyze-repository.service';
import { AnalyzeRepositoryDto } from '../../application/dto/analyze-repository.dto';

@Controller()
export class RepositoryController {
  constructor(
    private readonly analyzeRepositoryService: AnalyzeRepositoryService,
  ) {}

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
```

**File**: `src/presentation/controllers/health.controller.ts`
```typescript
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckHealthService } from '../../application/services/check-health.service';

@Controller()
export class HealthController {
  constructor(private readonly checkHealthService: CheckHealthService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    const result = await this.checkHealthService.execute();
    return {
      success: true,
      data: result,
    };
  }
}
```

### Step 5.2: Create Exception Filters

**File**: `src/presentation/filters/domain-exception.filter.ts`
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ValidationError, CodexExecutionError, PathAccessError } from '../../domain/errors';

@Catch(ValidationError, CodexExecutionError, PathAccessError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof CodexExecutionError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof PathAccessError) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
    }
    
    response.status(status).json({
      error: exception.constructor.name,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Step 5.3: Create Controller Modules

**File**: `src/presentation/controllers/code-generation.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { CodeGenerationController } from './code-generation.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [CodeGenerationController],
})
export class CodeGenerationModule {}
```

---

## Phase 6: Middleware and Security (Days 11-12)

### Step 6.1: Setup Global Middleware

**File**: `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Security middleware
  app.use(helmet());
  app.use(cors());
  
  // Body parsing (built into NestJS)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global exception filter
  app.useGlobalFilters(new DomainExceptionFilter());
  
  // Rate limiting (create as guard)
  
  const port = configService.get<number>('port');
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
```

### Step 6.2: Create Rate Limiting Guard

**File**: `src/presentation/guards/rate-limit.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return new Promise((resolve) => {
      this.limiter(request, response, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
```

---

## Phase 7: Testing and Documentation (Days 13-14)

### Step 7.1: Setup Testing

```bash
# Install testing dependencies
npm install --save-dev @nestjs/testing jest supertest
npm install --save-dev @types/jest @types/supertest
```

**File**: `src/presentation/controllers/code-generation.controller.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CodeGenerationController } from './code-generation.controller';
import { GenerateCodeService } from '../../application/services/generate-code.service';

describe('CodeGenerationController', () => {
  let controller: CodeGenerationController;
  let service: GenerateCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeGenerationController],
      providers: [
        {
          provide: GenerateCodeService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CodeGenerationController>(CodeGenerationController);
    service = module.get<GenerateCodeService>(GenerateCodeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests...
});
```

### Step 7.2: Setup OpenAPI Documentation

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

**Update**: `src/main.ts`
```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ... in bootstrap function
const config = new DocumentBuilder()
  .setTitle('Code Agent API')
  .setDescription('HTTP wrapper for OpenAI Codex CLI functionality')
  .setVersion('2.0')
  .build();
  
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

---

## Phase 8: Deployment and Migration (Days 15-16)

### Step 8.1: Update Docker Configuration

**File**: `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/

# Expose port
EXPOSE 3002

# Start application
CMD ["node", "dist/main"]
```

**Update**: `package.json`
```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main"
  }
}
```

### Step 8.2: Environment Variables

**File**: `.env.example`
```env
NODE_ENV=development
PORT=3002
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Phase 9: Final Integration and Testing (Days 17-21)

### Step 9.1: Integration Testing
- Test all endpoints with the same requests as the Express version
- Verify response formats match exactly
- Performance testing to ensure no regression

### Step 9.2: Deployment Strategy
1. **Parallel Deployment**: Run both versions side by side
2. **Gradual Migration**: Route percentage of traffic to NestJS version
3. **Full Cutover**: Switch all traffic once confident
4. **Cleanup**: Remove old Express application

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current application
- [ ] Document current API contracts
- [ ] Set up development environment
- [ ] Create feature branch

### Domain Layer
- [ ] Copy domain entities (no changes)
- [ ] Copy domain errors (no changes)
- [ ] Verify domain logic works in new structure

### Infrastructure Layer
- [ ] Convert CodexCLIService to NestJS provider
- [ ] Convert PathValidatorService to NestJS provider
- [ ] Convert ResponseFormatterService to NestJS provider
- [ ] Create InfrastructureModule

### Application Layer
- [ ] Convert GenerateCode use case to service
- [ ] Convert AnalyzeRepository use case to service
- [ ] Convert CheckHealth use case to service
- [ ] Create DTOs for validation
- [ ] Create ApplicationModule

### Presentation Layer
- [ ] Convert controllers to NestJS controllers
- [ ] Implement validation pipes
- [ ] Create exception filters
- [ ] Set up middleware (security, CORS, rate limiting)

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for controllers
- [ ] End-to-end tests for API endpoints

### Documentation
- [ ] OpenAPI/Swagger documentation
- [ ] Update README.md
- [ ] API usage examples

### Deployment
- [ ] Update Docker configuration
- [ ] Environment variable configuration
- [ ] CI/CD pipeline updates
- [ ] Production deployment strategy

---

## Risk Mitigation

### Low Risk Items
- Domain logic (no changes needed)
- Core business functionality (use cases become services)
- API contracts (can maintain exact same endpoints)

### Medium Risk Items
- Dependency injection (manual container → NestJS DI)
- Error handling (custom → NestJS exception filters)
- Middleware (Express → NestJS guards/interceptors)

### Mitigation Strategies
1. **Incremental Migration**: Migrate one module at a time
2. **Parallel Testing**: Run both versions during transition
3. **Comprehensive Testing**: Unit, integration, and E2E tests
4. **Rollback Plan**: Keep Express version available for quick rollback

---

## Expected Benefits Post-Migration

1. **Developer Experience**
   - Better IDE support with TypeScript
   - Decorators make code more declarative
   - Built-in validation and error handling

2. **Maintainability**
   - Stronger type safety
   - Better dependency injection
   - Standardized project structure

3. **Features**
   - Auto-generated API documentation
   - Built-in testing utilities
   - Rich ecosystem of modules

4. **Performance**
   - Similar performance to Express (runs on Express)
   - Better memory management with DI
   - Optimized build process

---

## Success Criteria

- [ ] All existing endpoints work identically
- [ ] Response times within 5% of current performance
- [ ] All tests passing (unit, integration, E2E)
- [ ] Documentation complete and accurate
- [ ] Deployment pipeline working
- [ ] Team trained on NestJS patterns

This migration plan maintains your excellent clean architecture while leveraging NestJS's powerful features. The domain layer remains untouched, proving the value of your current architectural decisions!