'use strict';
import 'dotenv/config';

const viewName = 'user_roles_view';
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
    R.id AS "roleID",
    R.name AS "roleName",
    R."parentID" AS "roleParentID"
  FROM user_roles AS UR
    LEFT JOIN users AS U ON U.id = UR."userID"
    LEFT JOIN roles AS R ON R.id = UR."roleID"
  WHERE
    UR.status = true
    AND U.status = true
    AND CAST((U."verified"#>>'{phone}') AS BOOLEAN) = true
    AND CAST((U."verified"#>>'{email}') AS BOOLEAN) = true
    AND U."isCompleted" = true
    AND R.status = true;
`;

async function up({ context: queryInterface }) {
  return queryInterface.sequelize.query(query);
}

async function down({ context: queryInterface }) {
  return queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${viewName}`);
}

export { up, down };
