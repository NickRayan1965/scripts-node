const { faker } = require("@faker-js/faker");

const createProduct = async ({
  host,
  jwt,
}) => {
  const body = {
    name: 'Producto' + faker.string.nanoid(10),
  };
  const response = await fetch(`${host}/api/v1/product`, {
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
  createProduct,
};
