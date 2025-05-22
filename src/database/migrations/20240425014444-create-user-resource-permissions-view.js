'use strict';
import 'dotenv/config';

const viewName = 'user_resource_permissions_view';
const query = `
  DROP VIEW IF EXISTS ${viewName};
  CREATE VIEW ${viewName} AS
    SELECT
    ROW_NUMBER() OVER () AS id,
    U.id AS "userID",
    U.first_name AS "userFirstName",
    U.last_name AS "userLastName",
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
  FROM user_resource_permissions AS URP
    LEFT JOIN users AS U ON U.id = URP."userID"
    LEFT JOIN resources AS R ON R.id = URP."resourceID"
    LEFT JOIN permissions AS P ON P.id = URP."permissionID"
  WHERE
    URP.status = true
    AND U.status = true
    AND CAST((U."verified"#>>'{phone}') AS BOOLEAN) = true
    AND CAST((U."verified"#>>'{email}') AS BOOLEAN) = true
    AND U."isCompleted" = true
    AND R.status = true
    AND P.status = true;
`;

async function up({ context: queryInterface }) {
  return queryInterface.sequelize.query(query);
}

async function down({ context: queryInterface }) {
  return queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${viewName}`);
}

export { up, down };
