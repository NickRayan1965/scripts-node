const {
  createAllForOrderReportBilling,
} = require('./helpers/create-all-for-order-report-billing');
const fs = require('fs');
const { login } = require('./utils/login.requests');
const { createCreditNote } = require('./utils/credit-note.requests');
const {
  createCompletedOrderReport,
} = require('./helpers/create-completed-order-report');
const host = 'http://localhost:4000';

(async () => {
  const { jwt } = await login({
    host,
    credentials: {
      user_name_or_email: 'john.doe@example.com',
      password: 'Password1',
    },
  });

  const {
    billing,
    billingFile,
    clientId,
    districtResidencyId,
    languageId,
    nationalityCountryId,
    orderClassId,
    personId,
    clientReportPriceId,
  } = await createAllForOrderReportBilling({
    host,
    jwt,
  });

  const completedOrderReport = await createCompletedOrderReport({
    host,
    jwt,
    clientId,
    districtResidencyId,
    languageId,
    nationalityCountryId,
    orderClassId,
    personId,
    clientReportPriceId,
  });
  console.log('completedOrderReport', completedOrderReport);
  const creditNote = await createCreditNote({
    host,
    jwt,
    billingHeaderId: billing.id,
    
    details: [
      {
        orderReportId: completedOrderReport,
        apply_penalty: false,
      },
      {
        orderReportId: billing.details[0].orderReport.id,
      },
    ],
  });
  console.log({ creditNote });
})();
