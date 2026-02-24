import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TestRunEntity } from './test-run.entity';

@Entity('scenarios')
export class ScenarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Stores the full scenario JSON (context.variables + cases array)
   */
  @Column({ type: 'json' })
  context: {
    variables: Array<{
      name: string;
      value: string;
      is_secret: boolean;
    }>;
  };

  @Column({ type: 'json' })
  cases: Array<{
    start_url: string;
    user_story: string;
  }>;

  @OneToMany(() => TestRunEntity, (run) => run.scenario)
  runs: TestRunEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
