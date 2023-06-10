import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';

import { KubeDeployment, KubeService, KubeMutatingWebhookConfiguration, KubeSecret, IntOrString } from './imports/k8s';

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    const app_label = { app: 'node-labels-to-pods'};

    new KubeService(this, 'service', {
      spec: {
        ports: [{port: 443, targetPort: IntOrString.fromNumber(443), protocol: 'TCP'}],
        selector: app_label
      }
    });

    new KubeDeployment(this, 'deployment', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: app_label
        },
        template: {
          metadata: {labels: app_label},
          spec: {
            containers: [
              {
                name: 'node-to-pod',
                image: 
              }
            ]
          }
        }
      }
    });

  }
}

const app = new App();
new MyChart(app, 'src');
app.synth();
