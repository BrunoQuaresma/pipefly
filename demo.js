import { runSetup, runSteps, setupRepo } from "./pipefly.js";
import pipeConfig from "./pipefly.config.js";

async function run() {
  try {
    const config = {
      ...pipeConfig,
      //id: Math.random().toString(36).substr(2, 9),
      id: "xyb4wypwk",
    };

    await setupRepo(config);
    await runSetup(config, {
      onOutput: (message) => console.log(message),
    });
    await runSteps(config, {
      onOutput: (message) => console.log(message),
    });
  } catch (error) {
    console.error(error);
  }
}

run();
