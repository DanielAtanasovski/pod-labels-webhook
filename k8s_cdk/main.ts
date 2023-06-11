import { Construct } from "constructs";
import { App, Chart, ChartProps } from "cdk8s";

import {
  KubeDeployment,
  KubeService,
  KubeMutatingWebhookConfiguration,
  IntOrString,
} from "./imports/k8s";

import { Certificate } from "./imports/cert-manager.io";

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const labels = { app: "node-labels-to-pods" };
    const namespace = "default";

    //  Service
    new KubeService(this, "service", {
      spec: {
        ports: [
          {
            port: 443,
            targetPort: IntOrString.fromNumber(443),
            protocol: "TCP",
          },
        ],
        selector: labels,
      },
      metadata: {
        name: labels.app,
        namespace: namespace,
      },
    });

    // Deployment
    new KubeDeployment(this, "deployment", {
      metadata: {
        name: labels.app,
        namespace: "default",
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: labels,
        },
        template: {
          metadata: {
            labels: labels,
          },
          spec: {
            containers: [
              {
                name: labels.app,
                image: `${labels.app}:latest`,
                volumeMounts: [
                  {
                    name: "tls",
                    mountPath: "/etc/webhook/tls",
                  },
                ],
              },
            ],
            volumes: [
              {
                name: "tls",
                secret: {
                  secretName: `${labels.app}-tls`,
                },
              },
            ],
          },
        },
      },
    });

    // TLS Certificate (Cert-Manager CRD)
    new Certificate(this, "certificate", {
      metadata: {
        name: `${labels.app}-certificate`,
        namespace: namespace,
      },
      spec: {
        secretName: `${labels.app}-certificate-secret`,
        dnsNames: [`${labels.app}`, `${labels.app}.${namespace}`],
        issuerRef: {
          name: "self-signer",
        },
      },
    });

    // Mutating Webhook
    new KubeMutatingWebhookConfiguration(this, "mutating-webhook", {
      metadata: {
        name: `${labels.app}.acme.com`,
        annotations: {
          "cert-manager.io/inject-ca-from": `${namespace}/${labels.app}-certificate`,
        },
      },
      webhooks: [
        {
          name: `${labels.app}.acme.com`,
          rules: [
            {
              apiGroups: [""],
              apiVersions: ["v1"],
              operations: ["CREATE"],
              resources: ["pods"],
              scope: "*",
            },
          ],
          namespaceSelector: {
            matchLabels: {
              "mutating-webhook": "true",
            },
          },
          clientConfig: {
            service: {
              name: labels.app,
              namespace: `${namespace}`,
              path: "/mutate",
              port: 443,
            },
          },
          sideEffects: "None",
          admissionReviewVersions: ["v1"],
        },
      ],
    });
  }
}

const app = new App();
new MyChart(app, "src");
app.synth();
