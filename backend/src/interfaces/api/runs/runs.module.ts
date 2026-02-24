import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestRunEntity } from '@/database/entities/test-run.entity';
import { TestResultEntity } from '@/database/entities/test-result.entity';
import { ScenarioEntity } from '@/database/entities/scenario.entity';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { GatewayModule } from '@/interfaces/api/gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestRunEntity, TestResultEntity, ScenarioEntity]),
    GatewayModule,
  ],
  controllers: [RunsController],
  providers: [RunsService],
})
export class RunsModule {}
