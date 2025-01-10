import { sequence } from '@sveltejs/kit/hooks';

import { beeper } from '@drop-in/beeper';
import { pass_routes } from '@drop-in/pass';
console.log('pass_routes', pass_routes);

beeper.send({
	to: 'test@test.com',
	subject: 'Test',
	html: '<h1>Test</h1>'
});

export const handle = sequence(pass_routes);
