import shelljs from "shelljs";

export async function setupRepo(config) {
  const childProcess = shelljs.exec(
    `git clone ${config.source.url} $(pwd)/releases/${config.name}/${config.id}`,
    { silent: true }
  );

  if (childProcess.code !== 0) {
    Promise.reject(childProcess.toString());
  }

  Promise.resolve();
}

export function runSetup(config, { onOutput } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const processes = {};
      const stepNames = Object.keys(config.setup);

      stepNames.forEach((stepName) => {
        const step = config.setup[stepName];
        const childProcess = shelljs.exec(step, {
          async: true,
          silent: true,
        });
        const process = {
          process: childProcess,
          output: [],
          status: "open",
          error: undefined,
        };
        processes[stepName] = process;
        childProcess.stdout.on("data", (message) => {
          process.output.push(message.toString());
          onOutput && onOutput(message.toString());
        });
        childProcess.stderr.on("data", (message) => {
          process.output.push(message.toString());
          onOutput && onOutput(message.toString());
        });
        childProcess.on("exit", () => {
          process.status = "success";
          resolveIfAllClosed(processes, resolve);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

function resolveIfAllClosed(processes, resolve) {
  const stepNames = Object.keys(processes);

  if (
    stepNames
      .map((name) => processes[name].status)
      .every((status) => status !== "open")
  ) {
    resolve();
  }
}
