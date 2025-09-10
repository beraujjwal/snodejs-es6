'use strict';
import 'dotenv/config';

const viewName = 'role_resource_permissions_view';
const postgresView = `
  CREATE VIEW ${viewName} AS
    SELECT
    ROW_NUMBER() OVER () AS id,
    R.id AS "roleID",
    R.name AS "roleName",
    R.slug AS "roleSlug",
    R."parentID" AS "roleParentID",
    RE.id AS "resourceID",
    RE.name AS "resourceName",
    RE.slug AS "resourceSlug",
    RE."parentID" AS "resourceParentID",
    P.id AS "permissionID",
    P.name AS "permissionName",
    P.slug AS "permissionSlug"
  FROM acl_role_resource_permissions AS RRP
    LEFT JOIN acl_roles AS R ON R.id = RRP."roleID"
    LEFT JOIN acl_resources AS RE ON RE.id = RRP."resourceID"
    LEFT JOIN acl_permissions AS P ON P.id = RRP."permissionID"
  WHERE
    RRP.status = true
    AND R.status = true
    AND R."deletedAt" IS NULL
    AND RE.status = true
    AND RE."deletedAt" IS NULL
    AND P.status = true
    AND P."deletedAt" IS NULL;
`;

const mysqlView = `
  CREATE VIEW ${viewName} AS
    SELECT
    ROW_NUMBER() OVER (ORDER BY RRP.id) AS id,
    R.id AS roleID,
    R.name AS roleName,
    R.slug AS roleSlug,
    R.parentID AS roleParentID,
    RE.id AS resourceID,
    RE.name AS resourceName,
    RE.slug AS resourceSlug,
    RE.parentID AS resourceParentID,
    P.id AS permissionID,
    P.name AS permissionName,
    P.slug AS permissionSlug
  FROM acl_role_resource_permissions AS RRP
    LEFT JOIN acl_roles AS R ON R.id = RRP.roleID
    LEFT JOIN acl_resources AS RE ON RE.id = RRP.resourceID
    LEFT JOIN acl_permissions AS P ON P.id = RRP.permissionID
  WHERE
    RRP.status = true
    AND R.status = true
    AND R.deletedAt IS NULL
    AND RE.status = true
    AND RE.deletedAt IS NULL
    AND P.status = true
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
