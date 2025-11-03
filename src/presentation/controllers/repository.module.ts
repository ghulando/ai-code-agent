import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { RepositoryController } from './repository.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [RepositoryController],
})
export class RepositoryModule {}
