import { IsString, IsArray, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class VariableDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsBoolean()
  is_secret: boolean;
}

export class CaseDto {
  @IsString()
  start_url: string;

  @IsString()
  user_story: string;
}

export class ContextDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariableDto)
  variables: VariableDto[];
}

export class CreateScenarioDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => ContextDto)
  context: ContextDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaseDto)
  cases: CaseDto[];
}
