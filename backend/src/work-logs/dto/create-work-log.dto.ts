import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

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
  @IsNotEmpty()
  workTypeId: number;
}
