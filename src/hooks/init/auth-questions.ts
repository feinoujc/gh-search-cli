import cli from 'cli-ux';

export default {
	ghe: () => cli.confirm('Do you have a github enterprise instance?'),
	apiUrl: () =>
		cli.prompt('What is your api url? (ex: https://github.company.com/api/v3)'),
	username: () => cli.prompt('What is your github username?'),
	password: () =>
		cli.prompt('What is your github password (not stored)?', { type: 'hide' }),
	otp: () => cli.prompt('What is your github OTP/2FA code?', { type: 'hide' }),
};
