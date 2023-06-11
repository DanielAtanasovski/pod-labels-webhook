import express from 'express';
import fs from 'fs';
import https from 'https';
import bodyParser from 'body-parser';

import { admissionregistrationK8sIo } from 'kubernetes-models';

const app = express();
const port = 4443;

type AdmissionRequestModel = {
  request: object;
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post(
  '/mutate',
  (
    req: express.Request<object, object, AdmissionRequestModel>,
    res: express.Response
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const admReq = req.body.request;
    console.log(admReq);
  }
);

https
  .createServer(
    {
      key: fs.readFileSync('/etc/certs/tls.key'),
      cert: fs.readFileSync('/etc/certs/tls.cert'),
    },
    app
  )
  .listen(port);
