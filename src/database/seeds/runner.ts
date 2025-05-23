#!/usr/bin/env bun

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DatabaseConnection } from '@database/connection';
import { logger } from '@utils/logger';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SeedRunner {
  private seedsPath: string;

  constructor() {
    this.seedsPath = __dirname;
  }

  async run(): Promise<void> {
    try {
      logger.info('Starting database seeding...');
      
      // Initialize database connection
      await DatabaseConnection.initialize();
      
      // Create seeds table if it doesn't exist
      await this.createSeedsTable();
      
      // Get seed files
      const seedFiles = this.getSeedFiles();
      
      for (const file of seedFiles) {
        await this.runSeed(file);
      }
      
      logger.info('All seeds completed successfully');
      
    } catch (error) {
      logger.error('Seeding failed:', error);
      process.exit(1);
    } finally {
      await DatabaseConnection.close();
    }
  }

  private async createSeedsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await DatabaseConnection.query(query);
    logger.info('Seeds table ready');
  }

  private getSeedFiles(): string[] {
    const files = readdirSync(this.seedsPath)
      .filter((file: string) => file.endsWith('.sql'))
      .sort();
    
    logger.info(`Found ${files.length} seed files`);
    return files;
  }

  private async runSeed(filename: string): Promise<void> {
    // Check if seed has already been run
    const checkQuery = 'SELECT id FROM seeds WHERE filename = $1';
    const existingSeed = await DatabaseConnection.query(checkQuery, [filename]);
    
    if (existingSeed.rows.length > 0) {
      logger.info(`Seed ${filename} already executed, skipping`);
      return;
    }

    logger.info(`Running seed: ${filename}`);
    
    // Read and execute seed file
    const filePath = join(this.seedsPath, filename);
    const seedSQL = readFileSync(filePath, 'utf-8');
    
    try {
      // Execute seed in a transaction
      await DatabaseConnection.transaction(async (client) => {
        // Execute the seed SQL
        await client.query(seedSQL);
        
        // Record the seed as completed
        await client.query(
          'INSERT INTO seeds (filename) VALUES ($1)',
          [filename]
        );
      });
      
      logger.info(`Seed ${filename} completed successfully`);
      
    } catch (error) {
      logger.error(`Seed ${filename} failed:`, error);
      throw error;
    }
  }
}

// Run seeds if this file is executed directly
const runner = new SeedRunner();
runner.run().catch(console.error);

export { SeedRunner }; 