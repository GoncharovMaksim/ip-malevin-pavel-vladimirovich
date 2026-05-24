import { IsDateString, IsOptional, IsNumber, IsString, Min } from 'class-validator';

export class UpdateWorkLogDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  volume?: number;

  @IsString()
  @IsOptional()
  performer?: string;

  @IsNumber()
  @IsOptional()
  workTypeId?: number;
}
