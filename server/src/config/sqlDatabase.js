import { Sequelize } from 'sequelize';

// Function to get SQL Server configuration (called after env is loaded)
const getSQLConfig = () => {
  // Parse instance name from host (e.g., "localhost\\SQLEXPRESS")
  const host = process.env.SQL_SERVER_HOST || 'localhost';
  const instanceName = host.includes('\\') ? host.split('\\')[1] : undefined;
  const serverName = host.includes('\\') ? host.split('\\')[0] : host;

  const dialectOptions = {
    options: {
      encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
      trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT !== 'false',
      enableArithAbort: true,
    },
    authentication: {
      type: 'default',
    },
  };

  // Only add instanceName if it exists
  if (instanceName) {
    dialectOptions.options.instanceName = instanceName;
  }

  return {
    dialect: 'mssql',
    host: serverName,
    port: instanceName ? undefined : (parseInt(process.env.SQL_SERVER_PORT) || 1433), // Don't set port for named instances
    database: process.env.SQL_SERVER_DATABASE || 'pvs_db',
    username: process.env.SQL_SERVER_USER || 'sa',
    password: process.env.SQL_SERVER_PASSWORD,
    dialectOptions,
    logging: false, // Disable SQL query logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    serverName,
    instanceName,
  };
};

// Store the SINGLE sequelize instance
let sequelize = null;
let serverName;
let instanceName;

// ONLY export a getter that returns existing instance
export const getSequelize = () => {
  if (!sequelize) {
    throw new Error('Sequelize not initialized yet! Call connectSQLDB() first.');
  }
  return sequelize;
};

// Reset sequelize instance
export const resetSequelize = () => {
  if (sequelize) {
    sequelize = null;
  }
};

export const connectSQLDB = async () => {
  try {
    // CREATE sequelize instance for the first time
    const config = getSQLConfig();
    serverName = config.serverName;
    instanceName = config.instanceName;

    sequelize = new Sequelize(config);
    const seq = sequelize;

    await seq.authenticate();
    console.log('✅ SQL Server Connected Successfully');

    // Initialize models AFTER connection is established, pass sequelize instance
    const { initModels } = await import('../models/sql/index.js');
    initModels(seq);
    console.log('✅ SQL Server models initialized');

    // Sync models in development (creates tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await seq.sync({ alter: false });
      console.log('✅ SQL Server tables synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to SQL Server:', error.message);
    console.error('Full error:', error);
    // Exit process since SQL Server is now PRIMARY database
    console.error('SQL Server is the primary database. Cannot continue without it.');
    process.exit(1);
  }
};

// Don't export default - models should use getSequelize() instead
export default getSequelize;
