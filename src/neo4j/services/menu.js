import moment from "moment";
import neo4j from "../../libraries/neo4j.library";
import cypher from "../cyphers";
import { BaseError } from "../../system/core/error/baseError";

export default {
  create: async (data) => {
    try {
      const cypherScript = cypher(`menu/create-menu`);
      const graphData = {
        _id: data.id || "null",
        parent: data.parent || "null",
        name: data.name || "null",
        slug: data.slug || "null",
        rights: data.rights?.filter((x) => !!x) || [],
        deleted: data.deleted || false,
        status: data.status || false,
        createdAt: data.createdAt
          ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss")
          : "null",
        updatedAt: data.updatedAt
          ? moment(data.updatedAt).format("YYYY-MM-DD HH:mm:ss")
          : "null",
      };

      const menu = await neo4j.write(cypherScript, graphData);

      if (data.parent) {
        const relationData = {
          child: data.id,
          parent: data.parent,
          date: data.createdAt
            ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss")
            : "null",
        };
        const relationScript = cypher(`menu/create-parent-child-relation`);
        await neo4j.write(relationScript, relationData);
      }

      const rights = data?.rights;
      if (rights?.length > 0) {
        for (const right of rights) {
          if (!right.fullDeny) {
            const resource = right.resource;
            delete right.resource;
            const rightData = {
              menu: data.id,
              resource,
              right: JSON.stringify(right),
            };
            const rightScript = cypher(`menu/set-rights`);
            await neo4j.write(rightScript, rightData);
          }
        }
      }
    } catch (err) {
      console.error(err);
      throw new BaseError(err.message);
    }
  },

  getUserByEmail: async (email) => {
    try {
      const cypherScript = cypher(`user/get-user-by-email`);
      return await neo4j.write(cypherScript, email);
    } catch (err) {
      throw new BaseError(err.message);
    }
  },

  getUserById: async (id) => {
    try {
      const cypherScript = cypher(`user/get-user-by-id`);
      return await neo4j.write(cypherScript, id);
    } catch (err) {
      throw new BaseError(err.message);
    }
  },

  updateUserByEmail: async (email, user) => {
    try {
      const cypherScript = cypher(`user/update-user-by-email`);
      return await neo4j.write(cypherScript, { email, ...user });
    } catch (err) {
      throw new BaseError(err.message);
    }
  },

  updateUserById: async (id, user) => {
    try {
      const cypherScript = cypher(`user/update-user-by-id`);
      return await neo4j.write(cypherScript, { id, ...user });
    } catch (err) {
      throw new BaseError(err.message);
    }
  },

  deleteUserById: async (id) => {
    try {
      const cypherScript = cypher(`user/delete-user-by-id`);
      return await neo4j.write(cypherScript, id);
    } catch (err) {
      throw new BaseError(err.message);
    }
  },
};