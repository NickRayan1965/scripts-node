const { faker } = require("@faker-js/faker");

const createClientReportPrice = async ({
  host,
  jwt,
  clientId,
  productId,
  countryId,
  currencyId,
  procedureTypeId,
}) => {
  const body = {
    product: productId,
    country: countryId,
    currency: currencyId,
    procedureType: procedureTypeId,
    price: faker.number.float({
      min: 0,
      max: 500,
      precision: 0.01,
    }),
    penalty: faker.number.float({
      min: 0,
      max: 100,
      precision: 0.01,
    }),
    min_days: faker.number.int({
      min: 0,
      max: 5,
    }),
    max_days: faker.number.int({
      min: 0,
      max: 5,
    }),
  };
  const response = await fetch(`${host}/api/v1/client-report-price?clientId=${clientId}`, {
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
  createClientReportPrice,
};
