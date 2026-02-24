import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioEntity } from '@/database/entities/scenario.entity';
import { CreateScenarioDto } from './dto/create-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectRepository(ScenarioEntity)
    private readonly scenariosRepo: Repository<ScenarioEntity>,
  ) {}

  findAll() {
    return this.scenariosRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const scenario = await this.scenariosRepo.findOne({ where: { id } });
    if (!scenario) throw new NotFoundException(`Scenario ${id} not found`);
    return scenario;
  }

  create(dto: CreateScenarioDto) {
    const scenario = this.scenariosRepo.create(dto);
    return this.scenariosRepo.save(scenario);
  }

  async update(id: string, dto: Partial<CreateScenarioDto>) {
    await this.findOne(id);
    await this.scenariosRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const scenario = await this.findOne(id);
    return this.scenariosRepo.remove(scenario);
  }
}
