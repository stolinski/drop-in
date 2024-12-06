import { sequence } from '@sveltejs/kit/hooks';

import { beeper } from '@drop-in/email';
import { pass_routes } from '@drop-in/pass';

beeper.send({
	to: 'test@test.com',
	subject: 'Test',
	html: '<h1>Test</h1>'
});

export const handle = sequence(pass_routes);
