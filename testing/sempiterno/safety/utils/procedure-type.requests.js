const { faker } = require("@faker-js/faker");

const createProcedureType = async ({
  host,
  jwt,
}) => {
  const body = {
    short_name: 'Proc ' + faker.string.nanoid(5),
    name: 'Tipo de procedimiento ' + faker.string.nanoid(5),
  };
  const response = await fetch(`${host}/api/v1/procedure-type`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}
module.exports = {
  createProcedureType,
};
