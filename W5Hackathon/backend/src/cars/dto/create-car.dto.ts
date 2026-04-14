import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  make: string;

  @IsNotEmpty()
  model: string;

  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  category: string;

  @Type(() => Number)
  @IsNumber()
  startingPrice: number;

  @IsDateString()
  auctionEndDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mileage?: number;

  @IsOptional()
  color?: string;

  @IsOptional()
  transmission?: string;

  @IsOptional()
  fuelType?: string;

  @IsOptional()
  vin?: string;

  @IsOptional()
  engineSize?: string;

  @IsOptional()
  hasGccSpecs?: string;

  @IsOptional()
  features?: string;

  @IsOptional()
  accidentHistory?: string;

  @IsOptional()
  serviceHistory?: string;

  @IsOptional()
  isModified?: string;

  @IsOptional()
  partyType?: string;
}
