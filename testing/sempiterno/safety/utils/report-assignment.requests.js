const { faker } = require("@faker-js/faker");

const createReportAssignment = async ({
  host,
  jwt,
  assignedUserId,
  orderReportId,
  state = 'WK',
}) => {
  const body = {
    is_on_time: true,
    assignedUser: assignedUserId,
    programed_start_date: '2023-10-05',
    programed_end_date: '2023-10-10',
    note: faker.lorem.sentence(),
    include_indicators: true,
    orderReport: orderReportId,
    state,
  };
  const response = await fetch(`${host}/api/v1/report-assignment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}
const changeReportAssignmentAprovedState = async ({
  host,
  jwt,
  is_approved,
  reportAssignmentId,
}) => {
  const body = {
    is_approved,
    response_note: faker.lorem.sentence(),
    reportAssignmentId,
  };
  const response = await fetch(`${host}/api/v1/report-assignment/change-aproved-state`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}
module.exports = {
  createReportAssignment,
  changeReportAssignmentAprovedState
};
