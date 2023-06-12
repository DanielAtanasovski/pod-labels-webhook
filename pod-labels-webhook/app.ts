import express from 'express';
import fs from 'fs';
import https from 'https';
import bodyParser from 'body-parser';

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
    // const admReq = req.body.request;
    console.log('REQUEST:');
    console.log(req);
    console.log('BODY');
    console.log(req.body);
  }
);

console.log(`Starting Server on port ${port}...`);
https
  .createServer(
    {
      key: fs.readFileSync('/etc/webhook/tls/tls.key'),
      cert: fs.readFileSync('/etc/webhook/tls/tls.crt'),
    },
    app
  )
  .listen(port);
