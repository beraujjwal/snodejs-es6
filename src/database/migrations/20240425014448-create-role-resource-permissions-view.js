'use strict';
import 'dotenv/config';

const viewName = 'role_resource_permissions_view';
const query = `
  DROP VIEW IF EXISTS ${viewName};
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
  FROM role_resource_permissions AS RRP
    LEFT JOIN roles AS R ON R.id = RRP."roleID"
    LEFT JOIN resources AS RE ON RE.id = RRP."resourceID"
    LEFT JOIN permissions AS P ON P.id = RRP."permissionID"
  WHERE
    RRP.status = true
    AND R.status = true
    AND RE.status = true
    AND P.status = true;
`;

async function up({context: queryInterface}) {
    return queryInterface.sequelize.query(query);
};

async function down({context: queryInterface}) {
    return queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${viewName}`);
};


export { up, down }