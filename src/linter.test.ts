import * as path from 'path';

import { version, lint } from './linter';
describe('linter tests', () => {
  it('returns version', async () => {
    expect(await version('php ./test/phpcs.phar')).toBe('3.5.5');
  });
  it('throws on non-version', async () => {
    await expect(version('git')).rejects.toHaveProperty(
      'message',
      expect.stringContaining('Unknown version or invalid executable of phpcs'),
    );
  });

  it('lints several files', async () => {
    expect(
      await lint(
        './test/fixtures/test1.php ./test/fixtures/test2.php',
        undefined,
        {
          standard: path.resolve(
            __dirname,
            '../test/preferBeautifierConfig/subFolder/phpcs.xml',
          ),
        },
      ),
    ).toMatchSnapshot();
  });

  it('should parse phpcs errors and rethrow', async () => {
    await expect(lint('byaka')).rejects.toHaveProperty(
      'message',
      'The file "byaka" does not exist.',
    );
  });
});
