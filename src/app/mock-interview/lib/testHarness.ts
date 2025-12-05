import { SupportedLanguage } from "./codingTypes";

/**
 * Generates executable code that wraps user code with test case execution.
 * The output should print the result so Judge0 can capture it.
 *
 * Note: testInput should be positional arguments (e.g., "3, 5" not "a = 3, b = 5")
 * The AI is instructed to generate test cases in this format.
 */
export function generateTestHarness(
  language: SupportedLanguage,
  userCode: string,
  functionName: string,
  testInput: string
): string {
  switch (language) {
    case "python":
      return `${userCode}

# Test execution
print(${functionName}(${testInput}))`;

    case "javascript":
      return `${userCode}

// Test execution
console.log(${functionName}(${testInput}));`;

    case "typescript":
      return `${userCode}

// Test execution
console.log(${functionName}(${testInput}));`;

    case "java":
      // Java needs the main method added to the class
      // We expect user code to be a class with the solution method
      return `${userCode.replace(/}\s*$/, "")}

    public static void main(String[] args) {
        System.out.println(${functionName}(${testInput}));
    }
}`;

    case "cpp":
      return `${userCode}

int main() {
    std::cout << ${functionName}(${testInput}) << std::endl;
    return 0;
}`;

    case "c":
      return `${userCode}

int main() {
    printf("%d\\n", ${functionName}(${testInput}));
    return 0;
}`;

    case "csharp":
      // C# needs the Main method added to the class
      return `${userCode.replace(/}\s*$/, "")}

    public static void Main(string[] args) {
        Console.WriteLine(${functionName}(${testInput}));
    }
}`;

    case "go":
      return `${userCode}

func main() {
    fmt.Println(${functionName}(${testInput}))
}`;

    case "ruby":
      return `${userCode}

# Test execution
puts ${functionName}(${testInput})`;

    case "rust":
      return `${userCode}

fn main() {
    println!("{}", ${functionName}(${testInput}));
}`;

    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

/**
 * Extract function name from function signature for different languages
 */
export function extractFunctionName(
  signature: string,
  language: SupportedLanguage
): string {
  switch (language) {
    case "python":
      // def function_name(params):
      const pyMatch = signature.match(/def\s+(\w+)\s*\(/);
      return pyMatch?.[1] || "solution";

    case "javascript":
    case "typescript":
      // function functionName(params) or functionName(params)
      const jsMatch = signature.match(/(?:function\s+)?(\w+)\s*\(/);
      return jsMatch?.[1] || "solution";

    case "java":
    case "csharp":
      // public static type functionName(params)
      const javaMatch = signature.match(/\s+(\w+)\s*\([^)]*\)\s*{?/);
      return javaMatch?.[1] || "solution";

    case "cpp":
    case "c":
      // type functionName(params)
      const cppMatch = signature.match(/\s+(\w+)\s*\([^)]*\)\s*{?/);
      return cppMatch?.[1] || "solution";

    case "go":
      // func functionName(params) returnType
      const goMatch = signature.match(/func\s+(\w+)\s*\(/);
      return goMatch?.[1] || "solution";

    case "ruby":
      // def function_name(params)
      const rbMatch = signature.match(/def\s+(\w+)\s*\(?/);
      return rbMatch?.[1] || "solution";

    case "rust":
      // fn function_name(params) -> returnType
      const rsMatch = signature.match(/fn\s+(\w+)\s*\(/);
      return rsMatch?.[1] || "solution";

    default:
      return "solution";
  }
}
