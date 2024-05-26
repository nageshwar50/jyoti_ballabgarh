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
docker build -t k8handson .
```
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/3c6507ad-7bc6-48ce-b3a1-81583de14fbb)

### Run the Docker Image

To run the Docker image for your application, execute the following command:

```bash
docker run -d -p 8000:8000 k8handson
```
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/f22386eb-30f7-4b4a-93fc-7374358ca675)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/0c1f8d55-6a63-4819-b641-c7b1091201da)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/3a80d1b3-26a5-472c-a944-c7a74f3ead9b)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/84608de7-9f5a-4936-b26c-7f69819f131d)

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

  
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/7efc4390-64aa-4138-bc4b-5689d9893f00)

## IAM Role for Amazon EKS Cluster

To manage access to your Amazon EKS cluster and its resources, you need to create an IAM role with appropriate permissions. Follow these steps to create the IAM role:

1. **Navigate to IAM Console**: Go to the IAM console in your AWS Management Console.

2. **Create a New Role**: Click on "Roles" in the left navigation pane and then click on "Create role".

3. **Choose the Service that will use this role**: Select "EKS" from the list of AWS services.

4. **Select Your Use Case**: Depending on your use case, choose  "EKS - Cluster" 
5. **Attach Permissions Policies**: Attach the necessary permissions policies to the role based on the permissions required by your EKS cluster. At a minimum, you may need policies like `AmazonEKSClusterPolicy` and `AmazonEKSServicePolicy`.

6. **Review and Create Role**: Review the role configuration and then click on "Create role" to finalize the creation of the IAM role.

Once the IAM role is created, you can use it when setting up your Amazon EKS cluster or node groups to grant the necessary permissions for managing and accessing the cluster resources.


![image](https://github.com/nageshwar50/k8shandson/assets/128671109/09cfec41-dcd7-4193-af27-e939f2513871)

![image](https://github.com/nageshwar50/k8shandson/assets/128671109/947ff407-133e-4764-9e9e-6fa1ac22ab2b)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/ace3f0ec-8c14-474d-a47a-b73e1efd61e5)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/89d15e1c-5220-423a-b089-fa7455313454)

![image](https://github.com/nageshwar50/k8shandson/assets/128671109/e14d0b61-2058-4842-92ac-5e1e15dc61a2)

### EKS may take 10-15 minutes to reach the active state.

![image](https://github.com/nageshwar50/k8shandson/assets/128671109/51814d91-ba71-4be3-ba36-dffa82ea12da)
## Adding Worker Nodes with IAM Role

To add worker nodes to your Amazon EKS cluster with an IAM role, follow these steps:

1. **Create IAM Role for Worker Nodes**:
   - Use the AWS IAM console to create a new IAM role for the worker nodes.
   - Attach the necessary policies to the role. Below is an example IAM policy that grants permissions required for worker nodes:
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/7c8597e9-f3dc-40a2-ba1b-1844716c62fc)
   
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/e6b28325-b011-43df-b392-814c78c9826b)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/0cf120da-929a-44a5-bfa8-bfa97b9e49d3)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/78452feb-bb3c-4252-b265-0a33be921a89)
### Worker Node 
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/ceb62808-1068-4716-97a5-410e613167e6)

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
### Once the Cluster is ready run the command to set context:

<pre>
  aws eks update-kubeconfig --name eks-handson --region ap-south-1
</pre>
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/4fec36d3-ec77-4c0a-bc92-71e4045f42bd)

<pre> kubectl create namespace pandey </pre>
<pre> kubectl get svc -n pandey </pre>
<pre> kubectl apply -f deployment.yaml -n pandey </pre>
<pre>kubectl get deployments -n pandey   </pre>
<pre> kubectl apply -f service.yaml -n pandey </pre>
<pre>  kubectl get services -n pandey </pre>
<pre> kubectl apply -f ingress.yaml -n pandey </pre>
<pre> kubectl get ingress -n pandey </pre>

![image](https://github.com/nageshwar50/k8shandson/assets/128671109/02191b32-c4dc-4d20-97af-3f0d7388d0eb)
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/a3a4ebf9-953a-4ff9-afb2-47eeb2bbce3a)

<pre> kubectl get pods -n pandey -o wide </pre>
<pre> kubectl describe pod frontend-6b5b54c879-q8qwz -n pandey </pre>
![image](https://github.com/nageshwar50/k8shandson/assets/128671109/08e8ee07-4931-417a-bf41-545131c35b2d)



# jyoti_ballabgarh
