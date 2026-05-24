import { Test, TestingModule } from '@nestjs/testing';
import { WorkLogsService } from './work-logs.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockWorkType = { id: 2, name: 'Кладка перегородок', unit: 'м³' };

const mockWorkLog = {
  id: 1,
  date: new Date('2026-05-24T00:00:00.000Z'),
  volume: 10,
  performer: 'Иванов И.И.',
  workTypeId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  workType: mockWorkType,
};

const mockPrismaService = {
  workLog: {
    findMany: jest.fn().mockResolvedValue([mockWorkLog]),
    findUnique: jest.fn().mockResolvedValue(mockWorkLog),
    create: jest.fn().mockResolvedValue(mockWorkLog),
    update: jest.fn().mockResolvedValue(mockWorkLog),
    delete: jest.fn().mockResolvedValue(mockWorkLog),
  },
  workType: {
    findUnique: jest.fn().mockResolvedValue(mockWorkType),
    create: jest.fn().mockResolvedValue({ id: 3, name: 'Монтаж вентиляции', unit: 'шт' }),
  },
};

describe('WorkLogsService', () => {
  let service: WorkLogsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkLogsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkLogsService>(WorkLogsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of work logs', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockWorkLog]);
      expect(prisma.workLog.findMany).toHaveBeenCalled();
    });

    it('should apply date filters', async () => {
      await service.findAll({ startDate: '2026-05-01', endDate: '2026-05-31' });
      expect(prisma.workLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ date: expect.any(Object) }),
        }),
      );
    });

    it('should default to desc sort order', async () => {
      await service.findAll({});
      expect(prisma.workLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { date: 'desc' } }),
      );
    });

    it('should use asc sort order when specified', async () => {
      await service.findAll({ sortOrder: 'asc' });
      expect(prisma.workLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { date: 'asc' } }),
      );
    });

    it('should fall back to desc for invalid sortOrder values', async () => {
      await service.findAll({ sortOrder: 'invalid' });
      expect(prisma.workLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { date: 'desc' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single work log', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workLog.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { workType: true },
      });
    });

    it('should throw NotFoundException if log not found', async () => {
      jest.spyOn(prisma.workLog, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a work log with an existing workTypeId', async () => {
      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 10,
        performer: 'Иванов И.И.',
        workTypeId: 2,
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workLog.create).toHaveBeenCalled();
    });

    it('should create a new workType when customWorkName is provided', async () => {
      jest.spyOn(prisma.workType, 'findUnique').mockResolvedValueOnce(null);

      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 5,
        performer: 'Иванов И.И.',
        customWorkName: 'Монтаж вентиляции',
        customWorkUnit: 'шт',
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workType.create).toHaveBeenCalled();
    });

    it('should reuse existing workType when customWorkName matches', async () => {
      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 5,
        performer: 'Иванов И.И.',
        customWorkName: 'Кладка перегородок',
        customWorkUnit: 'м³',
      };

      await service.create(dto);
      expect(prisma.workType.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no workType provided', async () => {
      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 10,
        performer: 'Иванов И.И.',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if workTypeId does not exist', async () => {
      jest.spyOn(prisma.workType, 'findUnique').mockResolvedValueOnce(null);

      const dto = {
        date: '2026-05-24T00:00:00.000Z',
        volume: 10,
        performer: 'Иванов И.И.',
        workTypeId: 99,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a work log', async () => {
      const dto = { volume: 20, performer: 'Сидоров С.С.' };
      const result = await service.update(1, dto);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workLog.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if log not found', async () => {
      jest.spyOn(prisma.workLog, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a work log', async () => {
      const result = await service.remove(1);
      expect(result).toEqual(mockWorkLog);
      expect(prisma.workLog.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if log not found', async () => {
      jest.spyOn(prisma.workLog, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
