#!/usr/bin/env bun

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { DatabaseConnection } from '@database/connection';
import { logger } from '@utils/logger';

class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = join(__dirname);
  }

  async run(): Promise<void> {
    try {
      logger.info('Starting database migrations...');
      
      // Initialize database connection
      await DatabaseConnection.initialize();
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get migration files
      const migrationFiles = this.getMigrationFiles();
      
      for (const file of migrationFiles) {
        await this.runMigration(file);
      }
      
      logger.info('All migrations completed successfully');
      
    } catch (error) {
      logger.error('Migration failed:', error);
      process.exit(1);
    } finally {
      await DatabaseConnection.close();
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await DatabaseConnection.query(query);
    logger.info('Migrations table ready');
  }

  private getMigrationFiles(): string[] {
    const files = readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    logger.info(`Found ${files.length} migration files`);
    return files;
  }

  private async runMigration(filename: string): Promise<void> {
    // Check if migration has already been run
    const checkQuery = 'SELECT id FROM migrations WHERE filename = $1';
    const existingMigration = await DatabaseConnection.query(checkQuery, [filename]);
    
    if (existingMigration.rows.length > 0) {
      logger.info(`Migration ${filename} already executed, skipping`);
      return;
    }

    logger.info(`Running migration: ${filename}`);
    
    // Read and execute migration file
    const filePath = join(this.migrationsPath, filename);
    const migrationSQL = readFileSync(filePath, 'utf-8');
    
    try {
      // Execute migration in a transaction
      await DatabaseConnection.transaction(async (client) => {
        // Execute the migration SQL
        await client.query(migrationSQL);
        
        // Record the migration as completed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
      });
      
      logger.info(`Migration ${filename} completed successfully`);
      
    } catch (error) {
      logger.error(`Migration ${filename} failed:`, error);
      throw error;
    }
  }
}

// Run migrations if this file is executed directly
// Note: import.meta.main is not available in all environments
// if (import.meta.main) {
//   const runner = new MigrationRunner();
//   runner.run().catch(console.error);
// }

// Run migrations when this file is executed directly
const runner = new MigrationRunner();
runner.run().catch(console.error);

export { MigrationRunner }; 