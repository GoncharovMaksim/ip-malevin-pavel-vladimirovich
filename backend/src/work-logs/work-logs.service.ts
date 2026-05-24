import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { UpdateWorkLogDto } from './dto/update-work-log.dto';

@Injectable()
export class WorkLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { startDate?: string; endDate?: string; sortOrder?: 'asc' | 'desc' }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const sortOrder = filters?.sortOrder || 'desc';

    return this.prisma.workLog.findMany({
      where,
      include: {
        workType: true,
      },
      orderBy: {
        date: sortOrder,
      },
    });
  }

  async findOne(id: number) {
    const log = await this.prisma.workLog.findUnique({
      where: { id },
      include: { workType: true },
    });
    if (!log) {
      throw new NotFoundException(`Запись с ID ${id} не найдена`);
    }
    return log;
  }

  async create(dto: CreateWorkLogDto) {
    let workTypeId = dto.workTypeId;

    if (!workTypeId && dto.customWorkName) {
      const name = dto.customWorkName.trim();
      const unit = (dto.customWorkUnit || 'шт').trim();
      
      let workType = await this.prisma.workType.findUnique({
        where: { name },
      });

      if (!workType) {
        workType = await this.prisma.workType.create({
          data: { name, unit },
        });
      }
      workTypeId = workType.id;
    }

    if (!workTypeId) {
      throw new NotFoundException('Не указан вид работы');
    }

    const workTypeExists = await this.prisma.workType.findUnique({
      where: { id: workTypeId },
    });

    if (!workTypeExists) {
      throw new NotFoundException(`Вид работы с ID ${workTypeId} не найден`);
    }

    return this.prisma.workLog.create({
      data: {
        date: new Date(dto.date),
        volume: dto.volume,
        performer: dto.performer,
        workTypeId,
      },
      include: {
        workType: true,
      },
    });
  }

  async update(id: number, dto: UpdateWorkLogDto) {
    await this.findOne(id);

    let workTypeId = dto.workTypeId;

    if (!workTypeId && dto.customWorkName) {
      const name = dto.customWorkName.trim();
      const unit = (dto.customWorkUnit || 'шт').trim();

      let workType = await this.prisma.workType.findUnique({
        where: { name },
      });

      if (!workType) {
        workType = await this.prisma.workType.create({
          data: { name, unit },
        });
      }
      workTypeId = workType.id;
    }

    if (workTypeId) {
      const workTypeExists = await this.prisma.workType.findUnique({
        where: { id: workTypeId },
      });
      if (!workTypeExists) {
        throw new NotFoundException(`Вид работы с ID ${workTypeId} не найден`);
      }
    }

    const data: any = {};
    if (dto.date) data.date = new Date(dto.date);
    if (dto.volume !== undefined) data.volume = dto.volume;
    if (dto.performer) data.performer = dto.performer;
    if (workTypeId !== undefined) data.workTypeId = workTypeId;

    return this.prisma.workLog.update({
      where: { id },
      data,
      include: {
        workType: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.workLog.delete({
      where: { id },
    });
  }
}
