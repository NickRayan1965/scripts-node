const { faker } = require("@faker-js/faker");

const createCountry = async ({ host, jwt, descriptions }) => {
  const body = {
    iso_cod: faker.string.nanoid(3),
    web_image: faker.image.url(),
    descriptions,
  };
  const response = await fetch(`${host}/api/v1/country`, {
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
  createCountry,
};
