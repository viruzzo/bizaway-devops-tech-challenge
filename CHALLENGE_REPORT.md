### **1. Containerization**
The `Dockerfile` is in the root of the project folder. It's based on the Alpine version of the Node.js image for the smallest footprint. The image build process splits off into a _build_ stage that builds the application with the dev dependencies and another that stores the production ones. The final image is created combining the build output and the prod dependencies. The image runs as a non-privileged user created for purpose.

---

### **2. Database Initialization**
The init script additionally creates a separate user for the application with access only to the relevant database. The script is executed at container initialisation by mounting it into the `/docker-entrypoint-initdb.d` of the MongoDB container.

---

### **3. Local Orchestration**
The `compose.yaml` file is in the root of the project folder. It creates the MongoDB instance with the init script above and checks for readiness before starting the web application container. The database URL is configured in the application from an env variable and the HTTP port exposed on the host.

---

### **4. Automation (CI/CD)**
The CI/CD pipeline is implemented as a GitHub workflow in `.github/workflows`. It builds the application and runs unit tests with coverage and E2E tests with a temporary MongoDB instance. Local testing can be achieved by installing https://nektosact.com/installation/index.html and running `act push`.

---

### **5. Security Fundamentals**
The container runs with no elevated privileges. See **7** for Kubernetes considerations.

---

### **6. Infrastructure as Code (IaC)**
Terraform infrastructure is defined in `terraform/`, using EKS on AWS. It creates a VPC and an EKS cluster in it with a single node group of small instances. Connection can be configured with `aws eks --region $(terraform output -raw region) update-kubeconfig --name $(terraform output -raw cluster_name)`.

---

### **7. Kubernetes Manifests**
The Kubernetes manifests are in `kustomize/`. They are designed to be applied with `kustomize build --load-restrictor LoadRestrictionsNone | kubectl apply -f -` or similar (in real environment they would be pushed to e.g. ArgoCD). They create a deployment in its own namespace for the web application, the readiness and liveness probes are implemented with a healthcheck endpoint added to the application that checks for a successful connection to the database. Containers in the web application namespace are subject to the `restricted` policy of the Kubernetes Pod Admission Controller (which requires amongst other things to run as an explicit non-root user and to drop all capabilities). MongoDB is run as a statefulset with a persistent volume in its own namespace.

A real world deployment should replace secret generation with e.g. SealedSecrets.

---

### **8. Monitoring**
The web application service has the scraping annotations that will be picked up by a standard deployment of Prometheus (e.g. via Helm).
