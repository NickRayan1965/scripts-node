const { createAssignmentResponse } = require('../utils/assignment-response.requests');
const { login } = require('../utils/login.requests');
const { createOrderReport } = require('../utils/order-report.requests');
const { createReportAssignment, changeReportAssignmentAprovedState } = require('../utils/report-assignment.requests');
const { createUser } = require('../utils/user.requests');

const createCompletedOrderReport = async ({
  host,
  jwt,
  clientId,
  clientReportPriceId,
  languageId,
  orderClassId,
  personId,
  nationalityCountryId,
  districtResidencyId,
}) => {
  const [orderReport, analyst, translator] = await Promise.all([
    createOrderReport({
      host,
      jwt,
      clientId,
      languageId,
      clientReportPriceId,
      orderClassId,
      personId,
      scheduled_end_date: '2023-10-10',
      scheduled_start_date: '2023-10-05',
      is_invoiced: true,
    }),
    createUser({
      host,
      jwt,
      nationalityCountryId,
      mainRoleName: 'ANALISTA',
      districtResidencyId,
    }),
    createUser({
      host,
      jwt,
      nationalityCountryId,
      mainRoleName: 'TRADUCTOR',
      districtResidencyId,
    }),
  ]);
  const [translatorAssignment, analystAssignment] = await Promise.all([
    createReportAssignment({
      host,
      jwt,
      orderReportId: orderReport.id,
      assignedUserId: translator.id,
      state: 'WK',
    }),
    createReportAssignment({
      host,
      jwt,
      orderReportId: orderReport.id,
      assignedUserId: analyst.id,
      state: 'WK',
    }),
  ]);
  const [loginAsAnalyst, loginAsTranslator] = await Promise.all([
    login({
      host,
      credentials: {
        user_name_or_email: analyst.user_name,
        password: '123456789',
      },
    }),
    login({
      host,
      credentials: {
        user_name_or_email: translator.user_name,
        password: '123456789',
      },
    }),
  ]);
  const [analystResponse, translatorResponse] = await Promise.all([
    createAssignmentResponse({
      host,
      jwt: loginAsAnalyst.jwt,
      reportAssignmentId: analystAssignment.id,
    }),
    createAssignmentResponse({
      host,
      jwt: loginAsTranslator.jwt,
      reportAssignmentId: translatorAssignment.id,
    }),
  ]);
  const [analystAprobation, translatorAprobation] = await Promise.all([
    changeReportAssignmentAprovedState({
      host,
      jwt,
      is_approved: true,
      reportAssignmentId: analystAssignment.id,
    }),
    changeReportAssignmentAprovedState({
      host,
      jwt,
      is_approved: true,
      reportAssignmentId: translatorAssignment.id,
    }),
  ]);
  return orderReport.id;
};
module.exports = {
  createCompletedOrderReport,
};