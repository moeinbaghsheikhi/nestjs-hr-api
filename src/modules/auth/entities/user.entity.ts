import { Role } from "src/shared/enums/user-role.enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshToken } from "./refresh-token.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    mobile: string;

    @Column()
    password: string; // hashed

    @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
    role: Role;

    @OneToMany(() => RefreshToken, rt=> rt.user)
    refreshTokens: RefreshToken[];
}