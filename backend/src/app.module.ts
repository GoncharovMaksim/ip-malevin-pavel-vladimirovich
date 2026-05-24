import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { WorkTypesModule } from './work-types/work-types.module';
import { WorkLogsModule } from './work-logs/work-logs.module';

@Module({
  imports: [PrismaModule, WorkTypesModule, WorkLogsModule],
})
export class AppModule {}
