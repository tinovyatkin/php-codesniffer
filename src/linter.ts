/**
 * Launches phpCs and returns results as JSON
 */

import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as assert from 'assert';

const execAsync = promisify(exec);

const EXECUTABLE_VERSIONS: Map<string, string> = new Map();
const DEFAULT_EXECUTABLE_PATH = path.resolve(
  __dirname,
  '../node_modules/php_codesniffer_master/bin/phpcs',
);

interface Options {
  encoding: string;
  standard: string;
}

const DEFAULT_OPTIONS: Partial<Options> = {
  encoding: 'UTF-8',
  standard: 'PEAR',
};

/**
 * Launches phpCs and returns current version
 */
export async function version(
  executablePath: string = DEFAULT_EXECUTABLE_PATH,
): Promise<string> {
  if (EXECUTABLE_VERSIONS.has(executablePath))
    return EXECUTABLE_VERSIONS.get(executablePath) as string;
  const { stdout } = await execAsync(`${executablePath} --version`, {
    windowsHide: true,
    timeout: 5000,
  });
  const ver = /^PHP_CodeSniffer version (?<ver>\d+\.\d+\.\d+)/i.exec(
    stdout.trim(),
  )?.groups?.ver;
  if (!ver)
    throw new ReferenceError(
      `Unknown version or invalid executable of phpcs, returned: "${stdout}"`,
    );
  EXECUTABLE_VERSIONS.set(executablePath, ver);
  return ver;
}

interface LinterMessage {
  message: string;
  source: string;
  severity: number;
  fixable: boolean;
  type: 'ERROR' | 'WARNING';
  line: number;
  column: number;
}
interface LintTotals {
  errors: number;
  warnings: number;
  fixable: number;
}

export async function lint(
  filenames: string | string[],
  executablePath = DEFAULT_EXECUTABLE_PATH,
  options = DEFAULT_OPTIONS,
): Promise<{
  totals: LintTotals;
  files: Record<
    string,
    { errors: number; warnings: number; message: LinterMessage[] }
  >;
}> {
  try {
    const ver = await version(executablePath);
    assert.ok(
      ver >= '2.6',
      `This library requires phpcs version 2.6 or later, received ${ver}`,
    );
    // we use promisified version, so, should not set exit code or it will throw
    const args = [
      '--report=json',
      '-q',
      `--encoding=${options.encoding}`,
      `--standard=${options.standard}`,
      '--runtime-set ignore_errors_on_exit 1',
      '--runtime-set ignore_warnings_on_exit 1',
    ];
    const { stdout } = await execAsync(
      `${executablePath} ${args.join(' ')} ${
        Array.isArray(filenames) ? filenames.join(' ') : filenames
      }`,
      {
        windowsHide: true,
        timeout: 15000,
      },
    );
    return JSON.parse(stdout);
  } catch (err) {
    if ('stdout' in err) {
      // Determine whether we have an error in stdout.
      const error = /^ERROR:\s?(?<error>.*)/i.exec(err.stdout)?.groups?.error;
      if (error) throw new Error(error.trim());
    }
    throw err;
  }
}
