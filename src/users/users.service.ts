import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto';

/**
 * Service pour la gestion des utilisateurs
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Crée un nouvel utilisateur avec mot de passe hashé
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email 
    });
    
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  /**
   * Trouve un utilisateur par email
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  /**
   * Trouve un utilisateur par ID
   */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  /**
   * Récupère tous les utilisateurs (sans les mots de passe)
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  /**
   * Valide le mot de passe d'un utilisateur
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
