import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OtpAuthApi implements ICredentialType {
	name = 'otpAuthApi';
	displayName = 'OTP Auth API';
	documentationUrl = 'https://github.com/yourusername/n8n-nodes-otp-auth';
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'http://localhost:3000/api',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional API key for authentication',
		},
	];
}