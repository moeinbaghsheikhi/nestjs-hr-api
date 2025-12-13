import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tokenHash: string;

    @ManyToOne(() => User, user => user.refreshTokens)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamp', nullable: true})
    revokedAt: Date | null;
}