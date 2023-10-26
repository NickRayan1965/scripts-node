const { faker } = require("@faker-js/faker");

const createClient = async ({
  host,
  jwt,
  countryId,
  billingLanguageId,
  reportLanguageId,
  apply_penalty_for_late_delivery = true,
}) => {
  const body = {
    name: 'Client ' + faker.string.nanoid(10),
    country: countryId,
    billingLanguage: billingLanguageId,
    reportLanguage: reportLanguageId,
    apply_penalty_for_late_delivery,
  };
  const response = await fetch(`${host}/api/v1/client`, {
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
  createClient,
};
