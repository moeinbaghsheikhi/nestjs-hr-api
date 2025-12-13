import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { IsNull, Repository } from "typeorm";
import { RefreshToken } from "./entities/refresh-token.entity";
import { Role } from "../../shared/enums/user-role.enum";
import * as bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(RefreshToken) private rtRepo: Repository<RefreshToken>,
        private jwtService: JwtService,
        private config: ConfigService
    ){}

    async register(mobile: string, password: string, role: Role = Role.EMPLOYEE){
        const alreadyExistMobile = await this.findUserByMobile(mobile);
        if(alreadyExistMobile) throw new BadRequestException("شماره موبایل از قبل وجود دارد");

        const passwordHashed = await bcrypt.hash(password, 12);
        const user = this.userRepo.create({mobile, password: passwordHashed, role})

        return this.userRepo.save(user);
    }

    async validateUser(mobile: string, password: string){
        const user = await this.userRepo.findOne({ where: {
            mobile
        } })
        if(!user) throw new NotFoundException('کاربری با این شماره موبایل یافت نشد')

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) throw new UnauthorizedException('پسورد وارد شده صحیح نیست')
        
        return user;
    }

    async login(user: User){
        const payload = { sub: user.id, role: user.role }

        // Access token
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get('ACCESS_TOKEN_EXPIRE') || '15m'
        })

        
        // Refresh token
        const refreshToken = this.jwtService.sign(
        { sub: user.id },
        {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('REFRESH_TOKEN_EXPIRE') || '14d'
        })

        const tokenHash = await bcrypt.hash(refreshToken, 12)
        const rt = this.rtRepo.create({tokenHash, user})
        await this.rtRepo.save(rt);

        return {
            accessToken, 
            refreshToken,
            user
        }
    }


    async refreshToken(providedRefreshToken: string){
        let payload: any;
        try{
            payload = this.jwtService.verify(providedRefreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET')
            });
        } catch{
             throw new UnauthorizedException('Invalid refresh token!');
        }

        const userId = payload.sub;

        const tokens = await this.rtRepo
            .createQueryBuilder('rt')
            .leftJoinAndSelect('rt.user', 'user')
            .where('rt.userId = :userId', { userId })
            .andWhere('rt.revokedAt IS NULL')
            .getMany();

        if(!tokens.length) throw new BadRequestException('توکن شما معتبر نیست')

        for(const rt of tokens){
            const match = await bcrypt.compare(providedRefreshToken, rt.tokenHash)

            if(match){
                rt.revokedAt = new Date();
                await this.rtRepo.save(rt);

                const user = rt.user;

                const payload = { sub: user.id, role: user.role }

                // Access token
                const newAccessToken = this.jwtService.sign(payload, {
                    secret: this.config.get('JWT_ACCESS_SECRET'),
                    expiresIn: this.config.get('ACCESS_TOKEN_EXPIRE') || '15m'
                })

                
                // Refresh token
                const newRefreshToken = this.jwtService.sign(
                    { sub: user.id },
                    {
                        secret: this.config.get('JWT_REFRESH_SECRET'),
                        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRE') || '14d'
                    }
                )

                const tokenHash = await bcrypt.hash(newRefreshToken, 12)
                const refreshToken = this.rtRepo.create({tokenHash, user})
                await this.rtRepo.save(refreshToken);

                return {
                    newAccessToken,
                    newRefreshToken
                }
            }
        }
    }

    async logout(userId: number){
        await this.rtRepo.createQueryBuilder()
            .update(RefreshToken)
            .set({ revokedAt: () => 'NOW()' })
            .where('userId = :id', { id: userId })
            .execute();
    }

    async findUserById(userId: number){
        const user = await this.userRepo.findOne({where: {id: userId}})
        if(!user) throw new NotFoundException('User not found');
        return user;
    }

    async findUserByMobile(mobile: string){
        const user = await this.userRepo.findOne({where: {mobile}})
        if(!user) return false;
        return user;
    }
}