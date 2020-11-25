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

export async function runSetup(config, { onOutput } = {}) {
  const stepNames = Object.keys(config.setup);
  const releasePath = getReleasePath(config);

  await Promise.all(
    stepNames.map((name) => {
      const step = config.setup[name];
      return executeShell(step, releasePath, { onOutput });
    })
  );
}

export async function runSteps(config, { onOutput } = {}) {
  const stepNames = Object.keys(config.steps);
  const releasePath = getReleasePath(config);

  stepsLoop: for (const stepName of stepNames) {
    let scripts = [];
    const step = config.steps[stepName];

    if (typeof step === "string") {
      scripts = [step];
    } else if ("scripts" in step) {
      scripts = step.scripts;
    } else {
      throw new Error(`No scripts found for step "${stepName}"`);
    }

    for (const script of scripts) {
      const result = await executeShell(script, releasePath, { onOutput });

      if (result.status === "error") {
        break stepsLoop;
      }
    }
  }
}

function executeShell(command, dir, { onOutput } = {}) {
  return new Promise((resolve) => {
    shelljs.cd(dir);
    const childProcess = shelljs.exec(command, {
      async: true,
      silent: true,
    });
    const process = {
      process: childProcess,
      output: [],
      status: "open",
    };
    childProcess.stdout.on("data", (message) => {
      process.output.push(message.toString());
      onOutput && onOutput(message.toString());
    });
    childProcess.stderr.on("data", (message) => {
      process.output.push(message.toString());
      process.status = "error";
      onOutput && onOutput(message.toString());
    });
    childProcess.on("exit", (code) => {
      if (code === 0) {
        process.status = "success";
        return resolve(process);
      }

      process.status = "error";
      return resolve(process);
    });
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
