import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ScenarioEntity } from './scenario.entity';
import { TestResultEntity } from './test-result.entity';

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

@Entity('test_runs')
export class TestRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScenarioEntity, (scenario) => scenario.runs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'scenarioId' })
  scenario: ScenarioEntity;

  @Column({ nullable: true })
  scenarioId: string;

  /**
   * Snapshot of the scenario at the time of the run
   */
  @Column({ type: 'json' })
  snapshotCases: Array<{
    start_url: string;
    user_story: string;
  }>;

  @Column({ type: 'json' })
  snapshotVariables: Array<{
    name: string;
    value: string;
    is_secret: boolean;
  }>;

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: RunStatus;

  @Column({ nullable: true })
  completedAt: Date;

  @OneToMany(() => TestResultEntity, (result) => result.run, {
    cascade: true,
  })
  results: TestResultEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
