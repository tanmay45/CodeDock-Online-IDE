// src/snippets.js
const SNIPPETS = {
  python: `import sys

# Args (skip script name)
args = " ".join(sys.argv[1:])

# Stdin
stdin_data = sys.stdin.read().strip()

print("Args:", args)
print("Stdin:", stdin_data)
`,

  node: `// echo args and stdin
let data = '';

process.stdin.on('data', d => data += d);
process.stdin.on('end', () => {
  const args = process.argv.slice(2).join(' ');
  console.log('Args:', args);
  console.log('Stdin:', data.trim());
});
`,

  cpp: `#include <bits/stdc++.h>
using namespace std;

int main(int argc, char** argv) {
    // Collect args (skip argv[0])
    vector<string> args;
    for (int i = 1; i < argc; i++) {
        args.push_back(argv[i]);
    }

    // Read stdin
    string stdin_data, line;
    while (getline(cin, line)) {
        if (!stdin_data.empty()) stdin_data += "\\n";
        stdin_data += line;
    }

    // Output
    cout << "Args:";
    for (auto &a : args) cout << " " << a;
    cout << "\\n";

    cout << "Stdin: " << stdin_data << "\\n";
    return 0;
}
`
};

export default SNIPPETS;
