import shelljs from "shelljs";
import fs from "fs";

export async function setupRepo(config) {
  const path = getReleasePath(config);

  if (fs.existsSync(`${path}/`)) {
    Promise.resolve();
    return;
  }

  const childProcess = shelljs.exec(`git clone ${config.source.url} ${path}`, {
    silent: true,
  });

  if (childProcess.code !== 0) {
    Promise.reject(childProcess.toString());
    return;
  }

  Promise.resolve();
}

export function runSetup(config, { onOutput } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const processes = {};
      const stepNames = Object.keys(config.setup);
      const releasePath = getReleasePath(config);

      stepNames.forEach((stepName) => {
        shelljs.cd(releasePath);
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

function getReleasePath(config) {
  return `${config.path}/${config.name}/${config.id}`;
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
