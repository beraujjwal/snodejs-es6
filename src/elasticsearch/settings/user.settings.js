'use strict';
import schema from "../mapping/user.mapping";

export default {
  index: "user",
  type: "user",
  include_type_name: true,
  body: {
    properties: schema,
  },
};
