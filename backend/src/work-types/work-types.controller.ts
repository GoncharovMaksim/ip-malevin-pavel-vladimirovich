import { Controller, Get } from '@nestjs/common';
import { WorkTypesService } from './work-types.service';

@Controller('work-types')
export class WorkTypesController {
  constructor(private readonly workTypesService: WorkTypesService) {}

  @Get()
  async findAll() {
    return this.workTypesService.findAll();
  }
}
