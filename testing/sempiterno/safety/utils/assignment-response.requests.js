const { faker } = require("@faker-js/faker");

const createAssignmentResponse = async ({
  host,
  jwt,
  reportAssignmentId,
}) => {
  const body = {
    reportAssignmentId,
    note: faker.lorem.sentence(),
  };
  const response = await fetch(`${host}/api/v1/assignment-response`, {
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
  createAssignmentResponse,
};
