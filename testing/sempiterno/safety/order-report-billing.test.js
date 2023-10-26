const {
  createAllForOrderReportBilling,
} = require('./helpers/create-all-for-order-report-billing');
const fs = require('fs');
const { login } = require('./utils/login.requests');
const host = 'http://173.249.51.45:3050';

(async () => {
  const { jwt } = await login({
    host,
    credentials: {
      user_name_or_email: 'john.doe@example.com',
      password: 'Password1',
    },
  });
  
  const {billingId, billingFile} = await createAllForOrderReportBilling({
    host,
    jwt,
  });
  const response = await fetch(`${host}/api/v1/order-report-billing-header/get-xlsx/${billingId}`);
  console.log(billingId);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(`excel${Date.now()}.xlsx`, Buffer.from(buffer));
})();
