const readline = require('readline');

/**
 * Prompts the user with masked input so passwords and sensitive URIs
 * are never echoed into terminal output, screen recordings, or scrollback.
 *
 * @param {string} query - The prompt text to display.
 * @param {import('stream').Readable} [inStream=process.stdin] - The input stream.
 * @param {import('stream').Writable} [outStream=process.stdout] - The output stream.
 * @returns {Promise<string>} The entered string (unmasked in memory only).
 */
const askMasked = (query = 'Enter URI: ', inStream = process.stdin, outStream = process.stdout) => {
  return new Promise((resolve) => {
    // Non-interactive / piped fallback (e.g. CI, automated tests, or piped stdin)
    if (!inStream.isTTY) {
      const rl = readline.createInterface({ input: inStream, output: outStream });
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans ? ans.trim() : '');
      });
      return;
    }

    outStream.write(query);
    inStream.setRawMode(true);
    inStream.resume();
    inStream.setEncoding('utf8');

    let input = '';
    const cleanup = () => {
      try {
        inStream.setRawMode(false);
      } catch (e) {}
      inStream.pause();
      inStream.removeListener('data', onData);
    };

    const onData = (chunk) => {
      for (let i = 0; i < chunk.length; i++) {
        const ch = chunk[i];
        // Enter / Return / EOF
        if (ch === '\n' || ch === '\r' || ch === '\u0004') {
          cleanup();
          outStream.write('\n');
          resolve(input.trim());
          return;
        }
        // Ctrl+C (SIGINT)
        if (ch === '\u0003') {
          cleanup();
          outStream.write('\n[Operation Cancelled]\n');
          process.exit(130);
        }
        // Backspace
        if (ch === '\u0008' || ch === '\x7f') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            outStream.write('\b \b');
          }
        } else {
          input += ch;
          outStream.write('*');
        }
      }
    };

    inStream.on('data', onData);
  });
};

module.exports = askMasked;
