# Deploying a Simple Node.js Express Application on Kubernetes (EKS)

This guide will walk you through the steps to deploy a basic Node.js Express application on Kubernetes using Amazon EKS (Elastic Kubernetes Service).

## Prerequisites 
Before you begin, ensure you have the following:

- An AWS account with access to Amazon EKS.
- `kubectl` installed on your local machine. You can install `kubectl` by following the instructions [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/).

  <pre>
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    ls kubectl
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
    echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    kubectl version --client
    kubectl version --client --output=yaml
  </pre>
  ![image](https://github.com/nageshwar50/k8shandson/assets/128671109/402284bf-1879-49bf-803b-b482f0fbedd7)

- An existing Node.js Express application.

2. Dockerize Your Node.js Express Application
- Create a Dockerfile in the root directory of your Node.js Express application. Here's a sample Dockerfile:

<pre>
  FROM node:18 as builder

WORKDIR /build

COPY package*.json .
RUN npm install

COPY src/ src/
COPY tsconfig.json tsconfig.json

RUN npm run build

FROM node:18 as runner

WORKDIR /app

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules
COPY --from=builder build/dist dist/

CMD [ "npm", "start" ]
  
</pre>
### Building the Docker Image

To build the Docker image for your application, run the following command:

```bash
docker build -t jyoti .
```
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/c43914d7-5244-43eb-9cc7-6bacf7045ff6)

### Run the Docker Image

To run the Docker image for your application, execute the following command:

```bash
docker run -d -p 8000:8000 jyoti
```
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/701b3681-9e38-4479-a31b-005d4329a9ba)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/20556e05-b5f8-4896-9a34-18fa2a0191bc)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/51c33f8e-167c-465e-a47d-2dcfea395e9e)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/01f0a93c-fea8-4865-8bb9-0e711d8dcd30)

## VPC Setup

We've configured a Virtual Private Cloud (VPC) named `eks-vpc` with the following components:

- **Subnets**:
  - **ap-south-1a (A)**:
    - Public Subnet: eks-subnet-public1-ap-south-1a
    - Private Subnet: eks-subnet-private1-ap-south-1a
  - **ap-south-1b (B)**:
    - Public Subnet: eks-subnet-public2-ap-south-1b
    - Private Subnet: eks-subnet-private2-ap-south-1b

- **Route Tables**:
  - **eks-rtb-public**:
    - Route table for the public subnets, associated with the Internet Gateway (`eks-igw`).
  - **eks-rtb-private1-ap-south-1a**:
    - Route table for the private subnet `eks-subnet-private1-ap-south-1a`.
  - **eks-rtb-private2-ap-south-1b**:
    - Route table for the private subnet `eks-subnet-private2-ap-south-1b`.
  - **rtb-0e3c7d0ef6ac64bfc**:
    - Additional route table, possibly for specific routing requirements.

- **Network Connections**:
  - **eks-igw**:
    - Internet Gateway attached to the VPC.
  - **eks-nat-public1-ap-south-1a**:
    - NAT Gateway associated with the public subnet `eks-subnet-public1-ap-south-1a`.

  
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/a8fcc6c0-0f06-4ce8-9c19-8ea82a12ad9e)

## IAM Role for Amazon EKS Cluster

To manage access to your Amazon EKS cluster and its resources, you need to create an IAM role with appropriate permissions. Follow these steps to create the IAM role:

1. **Navigate to IAM Console**: Go to the IAM console in your AWS Management Console.

2. **Create a New Role**: Click on "Roles" in the left navigation pane and then click on "Create role".

3. **Choose the Service that will use this role**: Select "EKS" from the list of AWS services.

4. **Select Your Use Case**: Depending on your use case, choose  "EKS - Cluster" 
5. **Attach Permissions Policies**: Attach the necessary permissions policies to the role based on the permissions required by your EKS cluster. At a minimum, you may need policies like `AmazonEKSClusterPolicy` and `AmazonEKSServicePolicy`.

6. **Review and Create Role**: Review the role configuration and then click on "Create role" to finalize the creation of the IAM role.

Once the IAM role is created, you can use it when setting up your Amazon EKS cluster or node groups to grant the necessary permissions for managing and accessing the cluster resources.

![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/d6926e5c-1bc3-46c7-8ce5-49d23f1f990f)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/dd0f76b3-674e-4516-ae52-a5cf66bce345)

![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/0df0a413-e41c-40b1-8425-2e4f53483bb8)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/b97ce839-3355-40e3-8664-a58d134ad9e4)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/dae3f8dc-216c-4e0c-8891-5a9186b33464)

### EKS may take 10-15 minutes to reach the active state.
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/4bde76f3-916b-4534-8997-1587e5ba6b55)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/8d711a62-3610-41d6-a1e1-bba1015048e3)

## Adding Worker Nodes with IAM Role

To add worker nodes to your Amazon EKS cluster with an IAM role, follow these steps:

1. **Create IAM Role for Worker Nodes**:
   - Use the AWS IAM console to create a new IAM role for the worker nodes.
   - Attach the necessary policies to the role. Below is an example IAM policy that grants permissions required for worker nodes:

### Worker Node 
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/bdec1bac-b279-4efd-b9ed-c0be3839ac19)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/d4b3b6b7-7fe6-4fd2-ae3a-266ad15fb6b7)

## Creating AWS Access Keys and Configuring Terminal

To interact with AWS services from your terminal, you'll need AWS access keys. Follow these steps to create access keys and configure them on your terminal:

1. **Create AWS Access Keys**:
   - Log in to the AWS Management Console.
   - Navigate to the IAM (Identity and Access Management) dashboard.
   - Click on "Users" in the left navigation pane.
   - Select your IAM user or create a new one.
   - In the "Security credentials" tab, scroll down to "Access keys" and click "Create access key".
   - Note down the Access Key ID and Secret Access Key. These keys are used to authenticate API requests.

2. **Configure Access Keys on Terminal**:
   - Install and configure the AWS CLI on your terminal if you haven't already.
   - Run `aws configure` command.
   - Enter the Access Key ID and Secret Access Key when prompted.
   - Set the default region and output format as per your preference.

3. **Verify Configuration**:
   - After configuring AWS CLI, run `aws sts get-caller-identity` to verify that your access keys are properly configured.
   - You should see information about your IAM user, indicating that your credentials are working correctly.

Example AWS CLI Configuration:
```bash
aws configure
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: YOUR_DEFAULT_REGION
Default output format [None]: json
```
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/6161e78a-99bf-44e7-a5cd-11008db41ca8)
*********************
###  Lets push the Docker Image to  ECR Repository

1. Log in to the AWS Management Console.
2. Navigate to the **ECR** service.
3. Click on **Create repository**.
4. Provide a name for your repository.
5. Choose any additional settings as needed.
6. Click **Create repository**.
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/af5f1a27-9f1b-4316-a4cb-cf00e3bd5e0f)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/26e473fc-3689-4e2e-90fa-a134dadce7bc)


### Once the Cluster is ready run the command to set context:

<pre>
  aws eks update-kubeconfig --name jyoti_ballabgarh --region ap-south-1
</pre>
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/9d383d8e-8f7b-4d1a-9401-8e9aee6843c7)

<pre>kubectl get nodes </pre>
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/2e35dc89-3a81-44e5-88cf-40e535e83aeb)

<pre> kubectl apply -f namespace.yaml </pre>
<pre> kubectl apply -f deployment.yaml </pre>
<pre> kubectl apply -f service.yaml -n pandey </pre>
<pre>kubectl apply -f ingress.yaml   </pre>
<pre> kubectl get svc -n jyoti-app </pre>
<pre> kubectl get services -n jyoti-app </pre>
<pre> kubectl get ingress -n jyoti-app </pre>
<pre> kubectl get all -n jyoti-app </pre>

![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/943a177a-7122-4d9b-a2d9-53230530f66f)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/3e70a6e3-a68b-4eee-bf9c-97e4923582cf)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/df33220a-252c-455b-9494-ae9a225be3f6)
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/bf3b50fc-3906-490b-907f-2317b0725496)


<pre> kubectl get pods -n jyoti-app -o wide </pre>
<pre> kubectl describe pod jyoti-app-deployment-74c966b998-hr5sx -n jyoti-app </pre>
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/5684a484-ecd3-40ee-a920-9b3685664594)

### Delete All Resource 
<pre>
kubectl delete -f ingress.yaml
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
kubectl delete -f namespace.yaml
</pre>
![image](https://github.com/nageshwar50/jyoti_ballabgarh/assets/128671109/e0fae72c-b3bd-4a10-8ac6-e392929ec837)









