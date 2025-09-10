'use strict';
import 'dotenv/config';

const viewName = 'user_roles_view';
const postgresView = `
  CREATE VIEW ${viewName} AS
    SELECT
    ROW_NUMBER() OVER () AS id,
    U.id AS "userID",
    U."firstName" AS "userFirstName",
    U."lastName" AS "userLastName",
    U.phone AS "userPhone",
    U.email AS "userEmail",
    U."loginAttempts" AS "userLoginAttempts",
    U."blockExpires" AS "userBlockExpires",
    R.id AS "roleID",
    R.name AS "roleName",
    R."parentID" AS "roleParentID"
  FROM acl_user_roles AS UR
    LEFT JOIN gnrl_users AS U ON U.id = UR."userID"
    LEFT JOIN acl_roles AS R ON R.id = UR."roleID"
  WHERE
    UR.status = true
    AND U.status = true
    AND CAST((U."verified"#>>'{phone}') AS BOOLEAN) = true
    AND CAST((U."verified"#>>'{email}') AS BOOLEAN) = true
    AND U."isCompleted" = true
    AND U."deletedAt" IS NULL
    AND R.status = true
    AND R."deletedAt" IS NULL;
`;
const mysqlView = `
  CREATE VIEW ${viewName} AS
  SELECT
      ROW_NUMBER() OVER (ORDER BY UR.id) AS id,
      U.id AS userID,
      U.firstName AS userFirstName,
      U.lastName AS userLastName,
      U.phone AS userPhone,
      U.email AS userEmail,
      U.loginAttempts AS userLoginAttempts,
      U.blockExpires AS userBlockExpires,
      R.id AS roleID,
      R.name AS roleName,
      R.parentID AS roleParentID
  FROM acl_user_roles AS UR
  LEFT JOIN gnrl_users AS U ON U.id = UR.userID
  LEFT JOIN acl_roles  AS R ON R.id = UR.roleID
  WHERE
      UR.status = TRUE
      AND U.status = TRUE
      AND CAST(JSON_UNQUOTE(JSON_EXTRACT(U.verified, '$.phone')) AS UNSIGNED) = 1
      AND CAST(JSON_UNQUOTE(JSON_EXTRACT(U.verified, '$.email')) AS UNSIGNED) = 1
      AND U.isCompleted = TRUE
      AND U.deletedAt IS NULL
      AND R.status = TRUE
      AND R.deletedAt IS NULL;
`;

async function up({ context: queryInterface }) {
  const dbName = queryInterface.sequelize.getDialect();
  if (dbName === 'mysql') {
    return queryInterface.sequelize.query(mysqlView);
  } else if (dbName === 'postgres') {
    return queryInterface.sequelize.query(postgresView);
  }
}

async function down({ context: queryInterface }) {
  return queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${viewName}`);
}

export { up, down };
