const { faker } = require("@faker-js/faker");

const createDistrict = async ({
  host,
  jwt,
  countryId,
}) => {
  const body = {
    name: 'Distrito' + faker.string.nanoid(10),
  };
  const response = await fetch(`${host}/api/v1/district?countryId=${countryId}`, {
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
  createDistrict,
};
