'use strict';
import 'dotenv/config';

const viewName = 'user_resource_permissions_view';
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
    R.id AS "resourceID",
    R.name AS "resourceName",
    R.slug AS "resourceSlug",
    R."parentID" AS "resourceParentID",
    P.id AS "permissionID",
    P.name AS "permissionName",
    P.slug AS "permissionSlug"
  FROM acl_user_resource_permissions AS URP
    LEFT JOIN gnrl_users AS U ON U.id = URP."userID"
    LEFT JOIN acl_resources AS R ON R.id = URP."resourceID"
    LEFT JOIN acl_permissions AS P ON P.id = URP."permissionID"
  WHERE
    URP.status = true
    AND U.status = true
    AND CAST((U."verified"#>>'{phone}') AS BOOLEAN) = true
    AND CAST((U."verified"#>>'{email}') AS BOOLEAN) = true
    AND U."isCompleted" = true
    AND U."deletedAt" IS NULL
    AND R.status = true
    AND R."deletedAt" IS NULL
    AND P.status = true
    AND P."deletedAt" IS NULL;
`;
const mysqlView = `
  CREATE VIEW ${viewName} AS
  SELECT
    ROW_NUMBER() OVER (ORDER BY URP.id) AS id,
    U.id AS userID,
    U.firstName AS userFirstName,
    U.lastName AS userLastName,
    U.phone AS userPhone,
    U.email AS userEmail,
    U.loginAttempts AS userLoginAttempts,
    U.blockExpires AS userBlockExpires,
    R.id AS resourceID,
    R.name AS resourceName,
    R.slug AS resourceSlug,
    R.parentID AS resourceParentID,
    P.id AS permissionID,
    P.name AS permissionName,
    P.slug AS permissionSlug
  FROM acl_user_resource_permissions AS URP
    LEFT JOIN gnrl_users AS U ON U.id = URP.userID
    LEFT JOIN acl_resources AS R ON R.id = URP.resourceID
    LEFT JOIN acl_permissions AS P ON P.id = URP.permissionID
  WHERE
    URP.status = TRUE
    AND U.status = TRUE
    AND CAST(JSON_UNQUOTE(JSON_EXTRACT(U.verified, '$.phone')) AS UNSIGNED) = 1
    AND CAST(JSON_UNQUOTE(JSON_EXTRACT(U.verified, '$.email')) AS UNSIGNED) = 1
    AND U.isCompleted = TRUE
    AND U.deletedAt IS NULL
    AND R.status = TRUE
    AND R.deletedAt IS NULL
    AND P.status = TRUE
    AND P.deletedAt IS NULL;
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
