const { Client } = require('pg');

async function createDatabase() {
  // Connect to postgres database first
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'ai_chat_db'"
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE ai_chat_db');
      console.log('Database ai_chat_db created successfully');
    } else {
      console.log('Database ai_chat_db already exists');
    }

  } catch (error) {
    console.error('Error creating database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase(); 