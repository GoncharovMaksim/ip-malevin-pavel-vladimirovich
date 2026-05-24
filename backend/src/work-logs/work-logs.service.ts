import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { UpdateWorkLogDto } from './dto/update-work-log.dto';

@Injectable()
export class WorkLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { startDate?: string; endDate?: string; sortOrder?: string }) {
    const where: Prisma.WorkLogWhereInput = {};

    if (filters?.startDate || filters?.endDate) {
      const dateCondition: { gte?: Date; lte?: Date } = {};

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setUTCHours(0, 0, 0, 0);
        dateCondition.gte = start;
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setUTCHours(23, 59, 59, 999);
        dateCondition.lte = end;
      }

      where.date = dateCondition;
    }

    const sortOrder: 'asc' | 'desc' = filters?.sortOrder === 'asc' ? 'asc' : 'desc';

    return this.prisma.workLog.findMany({
      where,
      include: { workType: true },
      orderBy: { date: sortOrder },
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

  private async resolveWorkTypeId(name: string, unit: string): Promise<number> {
    const trimmedName = name.trim();
    const trimmedUnit = (unit || 'шт').trim();

    let workType = await this.prisma.workType.findUnique({
      where: { name: trimmedName },
    });

    if (!workType) {
      workType = await this.prisma.workType.create({
        data: { name: trimmedName, unit: trimmedUnit },
      });
    }

    return workType.id;
  }

  private async assertWorkTypeExists(id: number): Promise<void> {
    const exists = await this.prisma.workType.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Вид работы с ID ${id} не найден`);
    }
  }

  async create(dto: CreateWorkLogDto) {
    let workTypeId = dto.workTypeId;

    if (!workTypeId && dto.customWorkName) {
      workTypeId = await this.resolveWorkTypeId(
        dto.customWorkName,
        dto.customWorkUnit ?? 'шт',
      );
    }

    if (!workTypeId) {
      throw new BadRequestException('Не указан вид работы');
    }

    await this.assertWorkTypeExists(workTypeId);

    return this.prisma.workLog.create({
      data: {
        date: new Date(dto.date),
        volume: dto.volume,
        performer: dto.performer,
        workTypeId,
      },
      include: { workType: true },
    });
  }

  async update(id: number, dto: UpdateWorkLogDto) {
    await this.findOne(id);

    let workTypeId = dto.workTypeId;

    if (!workTypeId && dto.customWorkName) {
      workTypeId = await this.resolveWorkTypeId(
        dto.customWorkName,
        dto.customWorkUnit ?? 'шт',
      );
    }

    if (workTypeId !== undefined) {
      await this.assertWorkTypeExists(workTypeId);
    }

    const data: Prisma.WorkLogUpdateInput = {};
    if (dto.date) data.date = new Date(dto.date);
    if (dto.volume !== undefined) data.volume = dto.volume;
    if (dto.performer) data.performer = dto.performer;
    if (workTypeId !== undefined) data.workType = { connect: { id: workTypeId } };

    return this.prisma.workLog.update({
      where: { id },
      data,
      include: { workType: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.workLog.delete({ where: { id } });
  }
}
