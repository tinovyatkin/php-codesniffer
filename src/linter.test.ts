import * as path from 'path';
import * as semver from 'semver';

import { version, lint } from './linter';
describe('linter tests', () => {
  it('returns version', async () => {
    expect(await version('php ./test/phpcs.phar')).toBe('3.5.5');
    expect(semver.valid(await version())).toBeTruthy();
  });
  it('throws on non-version', async () => {
    await expect(version('git')).rejects.toHaveProperty(
      'message',
      expect.stringContaining('Unknown version or invalid executable of phpcs'),
    );
  });

  it('lints several files', async () => {
    const res = await lint(
      './test/fixtures/test1.php ./test/fixtures/test2.php',
      undefined,
      {
        standard: path.resolve(
          __dirname,
          '../test/preferBeautifierConfig/subFolder/phpcs.xml',
        ),
      },
    );
    expect(res.totals).toMatchInlineSnapshot(`
      Object {
        "errors": 13,
        "fixable": 13,
        "warnings": 1,
      }
    `);
    // result has fully qualifued file names, so, it will be different on CI
    expect(Object.values(res.files)).toMatchSnapshot();
  });

  it('should parse phpcs errors and rethrow', async () => {
    await expect(lint('byaka')).rejects.toHaveProperty(
      'message',
      'The file "byaka" does not exist.',
    );
  });
});
