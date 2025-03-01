import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import axios from 'axios';

export class OtpAuth implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OTP Authentication',
		name: 'otpAuth',
		icon: 'file:otpAuth.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with OTP Authentication API',
		defaults: {
			name: 'OTP Auth',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'otpAuthApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'OTP',
						value: 'otp',
					},
				],
				default: 'otp',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
					},
				},
				options: [
					{
						name: 'Generate',
						value: 'generate',
						description: 'Generate an OTP for a user',
						action: 'Generate an OTP',
					},
					{
						name: 'Verify',
						value: 'verify',
						description: 'Verify an OTP',
						action: 'Verify an OTP',
					},
					{
						name: 'Get Channels',
						value: 'getChannels',
						description: 'Get available authentication channels',
						action: 'Get available authentication channels',
					},
					{
						name: 'Get User',
						value: 'getUser',
						description: 'Get user information',
						action: 'Get user information',
					},
				],
				default: 'generate',
			},
			// Fields for Generate OTP
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
						operation: [
							'generate',
						],
					},
				},
				description: 'Name of the user',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
						operation: [
							'generate',
							'verify',
							'getUser',
						],
					},
				},
				description: 'ID of the user (optional for generate, required for verify)',
				required: true,
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'options',
				options: [
					{
						name: 'SMS',
						value: 'sms',
					},
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Voice Call',
						value: 'call',
					},
					{
						name: 'WhatsApp',
						value: 'whatsapp',
					},
				],
				default: 'sms',
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
						operation: [
							'generate',
							'verify',
						],
					},
				},
				description: 'Channel to send the OTP through',
				required: true,
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
						operation: [
							'generate',
						],
						channel: [
							'sms',
							'call',
							'whatsapp',
						],
					},
				},
				description: 'Phone number to send the OTP to',
				required: true,
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
						operation: [
							'generate',
						],
						channel: [
							'email',
						],
					},
				},
				description: 'Email to send the OTP to',
				required: true,
			},
			// Fields for Verify OTP
			{
				displayName: 'OTP',
				name: 'otp',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'otp',
						],
						operation: [
							'verify',
						],
					},
				},
				description: 'OTP to verify',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const credentials = await this.getCredentials('otpAuthApi');
		const apiUrl = credentials.apiUrl as string;
		const apiKey = credentials.apiKey as string;

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const headers: IDataObject = {};
		if (apiKey) {
			headers['Authorization'] = `Bearer ${apiKey}`;
		}

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'otp') {
					// Generate OTP
					if (operation === 'generate') {
						const name = this.getNodeParameter('name', i, '') as string;
						const userId = this.getNodeParameter('userId', i, '') as string;
						const channel = this.getNodeParameter('channel', i) as string;
						
						let phoneNumber = '';
						let email = '';
						
						if (['sms', 'call', 'whatsapp'].includes(channel)) {
							phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
						}
						
						if (channel === 'email') {
							email = this.getNodeParameter('email', i) as string;
						}
						
						const response = await axios.post(
							`${apiUrl}/generate-otp`,
							{
								name,
								userId,
								channel,
								phoneNumber,
								email,
							},
							{ headers }
						);
						
						returnData.push(response.data);
					}
					
					// Verify OTP
					if (operation === 'verify') {
						const userId = this.getNodeParameter('userId', i) as string;
						const otp = this.getNodeParameter('otp', i) as string;
						const channel = this.getNodeParameter('channel', i) as string;
						
						const response = await axios.post(
							`${apiUrl}/verify-otp`,
							{
								userId,
								otp,
								channel,
							},
							{ headers }
						);
						
						returnData.push(response.data);
					}
					
					// Get Channels
					if (operation === 'getChannels') {
						const response = await axios.get(
							`${apiUrl}/channels`,
							{ headers }
						);
						
						returnData.push(response.data);
					}
					
					// Get User
					if (operation === 'getUser') {
						const userId = this.getNodeParameter('userId', i) as string;
						
						const response = await axios.get(
							`${apiUrl}/users/${userId}`,
							{ headers }
						);
						
						returnData.push(response.data);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}