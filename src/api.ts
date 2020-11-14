import * as headerParser from 'parse-link-header';
import * as request from 'request-promise-native';

export type ApiOptions = {
	apiToken: string;
	baseUrl: string;
	sort: string;
	order: string;
	userAgent: string;
	textMatch: boolean;
};

export type ApiResponse = {
	items: Array<any>;
	links: {
		[rel: string]: () => Promise<ApiResponse>;
	};
	rate: {
		limit: number;
		remaining: number;
		reset: Date;
	};
};

const baseOpts = {
	json: true,
	resolveWithFullResponse: true,
	headers: {
		Accept: ['application/json', 'application/vnd.github.cloak-preview'],
	},
};
const req = request.defaults({ ...baseOpts });

function parseResponse(resp: any, opts: ApiOptions): ApiResponse {
	async function linkContinuation(url: string): Promise<ApiResponse> {
		const res = await req({
			auth: {
				user: '',
				password: opts.apiToken,
			},
			headers: {
				'User-Agent': opts.userAgent,
				Accept: opts.textMatch
					? [
							...baseOpts.headers.Accept,
							'application/vnd.github.v3.text-match+json',
					  ]
					: baseOpts.headers.Accept,
			},
			url,
		});
		return parseResponse(res, opts);
	}
	const result = {
		items: resp.body.items,
		links: {},
		rate: {
			limit: resp.headers['x-ratelimit-limit'] || Number.MAX_SAFE_INTEGER,
			remaining:
				resp.headers['x-ratelimit-remaining'] || Number.MAX_SAFE_INTEGER,
			reset: new Date((resp.headers['x-ratelimit-reset'] || 0) * 1000),
		},
	};
	if (resp.headers.link) {
		const links = headerParser(resp.headers.link) as headerParser.Links;
		result.links = Object.entries(links).reduce(
			(link, [k, v]) => ({
				...link,
				[k]: () => linkContinuation(v.url),
			}),
			{},
		);
	}
	return result;
}

export default async function search(
	type: string,
	query: string,
	opts: ApiOptions,
): Promise<ApiResponse> {
	const options = {
		auth: {
			user: '',
			password: opts.apiToken,
		},
		headers: {
			'User-Agent': opts.userAgent,
			Accept: opts.textMatch
				? [
						...baseOpts.headers.Accept,
						'application/vnd.github.v3.text-match+json',
				  ]
				: baseOpts.headers.Accept,
		},
		baseUrl: opts.baseUrl,
		url: `/search/${type}`,
		qs: {
			q: query,
			sort: opts.sort || undefined,
			order: opts.order || undefined,
		},
	};
	const resp = await req(options);
	return parseResponse(resp, opts);
}
