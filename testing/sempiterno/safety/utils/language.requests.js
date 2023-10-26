const { faker } = require("@faker-js/faker");

const createLanguage = async ({
  host,
  jwt,
  is_default = false,
}) => {
  const body = {
    short_description: 'Language ' + faker.string.nanoid(3),
    long_description: 'Language ' + faker.string.nanoid(5),
    is_default, 
  };
  const response = await fetch(`${host}/api/v1/language`, {
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
  createLanguage,
};
