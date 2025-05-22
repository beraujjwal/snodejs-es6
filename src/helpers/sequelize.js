import { sequelize } from '../system/core/db.connection.js';

export const createDBUser = async (username, dbPassword) => {
  try {
    await sequelize.query(
      `DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${username}') THEN
              REASSIGN OWNED BY ${username} TO postgres;
              DROP OWNED BY ${username};
          END IF;
      END $$;`
    );
    await sequelize.query(`DROP USER IF EXISTS ${username};`);
    console.log(`✅ User ${username} Dropped`);

    console.log(`✅ User ${username} permission Dropped`);
    await sequelize.query(`DROP ROLE IF EXISTS ${username};`);
    console.log(`✅ Role ${username} Dropped`);

    await sequelize.query(
      `CREATE USER ${username} WITH PASSWORD '${dbPassword}';`
    );
    console.log(`✅ User ${username} created`);

    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};

export const createDB = async (dbName, username) => {
  try {
    await sequelize.query(`DROP DATABASE IF EXISTS ${dbName};`);
    await sequelize.query(`CREATE DATABASE ${dbName};`).catch((err) => {
      if (!err.message.includes('Already exists')) throw err;
    });
    console.log(`✅ Database ${dbName} created succesfully.`);

    // 1. Grant access to the database itself
    await sequelize.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${username};`
    );

    // 2. Grant all privileges on all existing tables in the public schema
    await sequelize.query(
      `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${username};`
    );
    console.log(`✅ User ${username} assigned to ${dbName}.`);

    // 3. Grant all privileges on all existing sequences in the public schema
    await sequelize.query(
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${username};`
    );

    // 4. Grant all privileges on all existing functions in the public schema
    await sequelize.query(
      `GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${username};`
    );

    // 5. Automatically grant privileges on all future tables in the public schema
    await sequelize.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO ${username};`
    );

    // 6. Automatically grant privileges on all future sequences in the public schema
    await sequelize.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO ${username};`
    );

    // 7. Automatically grant privileges on all future functions in the public schema
    await sequelize.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO ${username};`
    );

    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};

export const dropDBUser = async (username) => {
  try {
    await sequelize.query(
      `DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${username}') THEN
              REASSIGN OWNED BY ${username} TO postgres;
              DROP OWNED BY ${username};
          END IF;
      END $$;`
    );
    await sequelize.query(`DROP USER IF EXISTS ${username};`);
    console.log(`✅ User ${username} Dropped`);

    console.log(`✅ User ${username} permission Dropped`);
    await sequelize.query(`DROP ROLE IF EXISTS ${username};`);
    console.log(`✅ Role ${username} Dropped`);

    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};

export const dropDB = async (dbName) => {
  try {
    await sequelize.query(`DROP DATABASE IF EXISTS ${dbName};`);
    console.log(`✘ DATABASE  ${dbName} dropped`);

    return true;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};
