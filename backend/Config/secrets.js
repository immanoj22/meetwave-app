import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
 
const client = new SecretsManagerClient({
  region: "ap-southeast-2",
});
 
export async function loadSecrets() {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: "stage/backend/env",
    })
  );
 
  const secrets = JSON.parse(response.SecretString);
 
  Object.entries(secrets).forEach(([key, value]) => {
    process.env[key] = value;
  });
 
  console.log("Secrets Loaded");
}