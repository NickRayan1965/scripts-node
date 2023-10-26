const { faker } = require("@faker-js/faker");

const createPerson = async ({
  host,
  jwt,
  countryId,
}) => {
  const body = {
    person_type: faker.datatype.boolean() ? 'P' : 'E',
    sex: faker.datatype.boolean() ? 'M' : 'F',
    name: 'Person ' + faker.string.nanoid(10),
    countryId,
  };
  const response = await fetch(`${host}/api/v1/person`, {
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
  createPerson,
};
