import JsdomEnvironment from 'jest-environment-jsdom';
import { Circus, Config } from '@jest/types';
import { EnvironmentContext } from '@jest/environment';

/**
 * This is a custom Jest environment used for more script-like tests.
 * Think of E2E tests, but in memory with JSDOM!
 * The key distinctions:
 * - We don't reset mocks between tests
 * - We quit early if a test fails
 */
class FauxE2eEnvironment extends JsdomEnvironment {
	private testHasFailed = false;

	constructor( config: Config.ProjectConfig, context: EnvironmentContext ) {
		config.resetMocks = false;
		super( config, context );
	}

	async setup() {
		await super.setup();
	}

	async teardown() {
		await super.teardown();
	}

	getVmContext() {
		return super.getVmContext();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async handleTestEvent( event: Circus.Event, _state: Circus.State ) {
		switch ( event.name ) {
			case 'test_start': {
				if ( this.testHasFailed ) {
					event.test.mode = 'skip';
				}
				break;
			}
			case 'test_fn_failure': {
				this.testHasFailed = true;
				break;
			}
		}
	}
}

export default FauxE2eEnvironment;
