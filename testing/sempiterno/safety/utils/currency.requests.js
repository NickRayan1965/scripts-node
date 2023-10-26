const { faker } = require("@faker-js/faker");

const createCurrency = async ({
  host,
  jwt,
  show_as_billing_currency = true
}) => {
  const body = {
    name: 'Moneda ' + faker.string.nanoid(10),
    symbol: faker.string.nanoid(5),
    iso_code: faker.string.nanoid(3),
    show_as_billing_currency,
  };
  const response = await fetch(`${host}/api/v1/currency`, {
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
  createCurrency,
};
