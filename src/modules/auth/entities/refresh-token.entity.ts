import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tokenHash: string;

    @ManyToMany(() => User, user => user.refreshTokens)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamp', nullable: true})
    revokedAt: Date | null;
}