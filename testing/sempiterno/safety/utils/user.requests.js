const { faker } = require("@faker-js/faker");
const { getRoles } = require("./role.requests");

const createUser = async ({
  host,
  jwt,
  //personal_email,
  districtResidencyId,
  nationalityCountryId,
  mainRoleName,
  extraRoleNames = [],
}) => {
  const roles = await getRoles({
    host,
    jwt,
  });

  const body = {
    user_name: faker.string.nanoid(15),
    names: faker.person.firstName(),
    last_name: faker.person.lastName(),
    mother_s_name: faker.person.lastName(),
    mainRoleId: roles.find((role) => role.name === mainRoleName).id,
    extraRolesIds: extraRoleNames.map((roleName) =>
      roles.find((role) => role.name === roleName).id
    ),
    account_state: 'U',
    identity_document_type: 'D',
    nationalityCountryId,
    districtResidencyId,
    birth_date: faker.date.past().toISOString().split('T')[0],
    phone: faker.phone.number(),
    personal_email: faker.internet.email(),
    sex: 'M',
  };
  //peticion tipo form-data
  const response = await fetch(`${host}/api/v1/user`, {
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
  createUser,
};
