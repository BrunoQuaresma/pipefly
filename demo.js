import { runSetup, setupRepo } from "./pipefly.js";
import pipeConfig from "./pipefly.config.js";

async function run() {
  const config = {
    ...pipeConfig,
    id: Math.random().toString(36).substr(2, 9),
  };

  await setupRepo(config);
  const setupResult = await runSetup(config, {
    onOutput: (message) => console.log(message),
  });
}

run();
