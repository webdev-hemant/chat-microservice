const { Sequelize } = require("sequelize");
const {
  DB: { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME },
  NODE_ENV,
} = require("../src/config/allEnv");

const sequelize = new Sequelize("postgres", DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  dialectOptions: {
    ssl:
      NODE_ENV === "PROD"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
});

const deleteDatabase = async () => {
  const DATABASE_NAME = DB_NAME;
  try {
    // Connect to the PostgreSQL server
    // await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Terminate any connections to the target database
    await sequelize.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '${DATABASE_NAME}'
        AND pid <> pg_backend_pid();
    `);

    // Drop the database
    await sequelize.query(`DROP DATABASE IF EXISTS "${DATABASE_NAME}";`);
    console.log(`Database "${DATABASE_NAME}" has been deleted.`);

    // Create the new database
    await sequelize.query(`CREATE DATABASE "${DATABASE_NAME}";`);
    console.log(`Database "${DATABASE_NAME}" has been created.`);
  } catch (error) {
    console.error("Unable to drop the database:", error);
  } finally {
    await sequelize.close();
  }
};

deleteDatabase();
