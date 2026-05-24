import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkLogDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @Min(0.01)
  volume: number;

  @IsString()
  @IsNotEmpty()
  performer: string;

  @IsNumber()
  @IsOptional()
  workTypeId?: number;

  @IsString()
  @IsOptional()
  customWorkName?: string;

  @IsString()
  @IsOptional()
  customWorkUnit?: string;
}
