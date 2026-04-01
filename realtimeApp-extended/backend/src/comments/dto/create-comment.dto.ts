import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
