const { createCountry } = require("./utils/country.requests");
const { createDistrict } = require("./utils/district.requests");
const { login } = require("./utils/login.requests");
const { createUser } = require("./utils/user.requests");

const host = 'http://173.249.51.45:3050';
(async () => {
  const { jwt } = await login({
    host,
    credentials: {
      user_name_or_email: 'john.doe@example.com',
      password: 'Password1',
    },
  });
  const country = await createCountry({
    host,
    jwt,
  });
  const district = await createDistrict({
    host,
    jwt,
    countryId: country.id,
  });
  const productionCoordinator = await createUser({
    host,
    jwt,
    mainRoleName: 'COORD PRODUCCION',
    districtResidencyId: district.id,
    nationalityCountryId: country.id,
  });
  console.log({ productionCoordinator });
})();