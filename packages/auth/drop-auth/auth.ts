import { AuthService } from './auth-service';
import { DrizzlePostgresDataSource } from './drizzle-pg-source';

export const auth = new AuthService(new DrizzlePostgresDataSource());
