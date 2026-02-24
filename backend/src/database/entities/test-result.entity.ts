import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TestRunEntity } from './test-run.entity';

@Entity('test_results')
export class TestResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TestRunEntity, (run) => run.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'runId' })
  run: TestRunEntity;

  @Column()
  runId: string;

  @Column()
  caseIndex: number;

  @Column({ type: 'text' })
  userStory: string;

  @Column({ type: 'text' })
  startUrl: string;

  @Column({ default: false })
  passed: boolean;

  @Column({ type: 'text', nullable: true })
  reason: string;

  /**
   * Duration in milliseconds
   */
  @Column({ nullable: true })
  durationMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
