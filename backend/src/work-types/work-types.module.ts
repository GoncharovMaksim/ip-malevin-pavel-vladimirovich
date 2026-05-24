import { Module } from '@nestjs/common';
import { WorkTypesService } from './work-types.service';
import { WorkTypesController } from './work-types.controller';

@Module({
  providers: [WorkTypesService],
  controllers: [WorkTypesController],
})
export class WorkTypesModule {}
