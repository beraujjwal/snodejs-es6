'use strict';
import neo4j from '../../libraries/neo4j.library.js';

import User from '../../models/user.model.js';


async function insertInitialUsersData() {
  try {
    const query = `
      UNWIND $users AS user
      CREATE (:User {name: user.name, email: user.email})
    `;

    const users = [
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", email: "bob@example.com" },
      { name: "Charlie", email: "charlie@example.com" }
    ];

    await session.run(query, { users });
    console.log("Initial data inserted into Neo4j");

  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

// Run the script
insertInitialUsersData();