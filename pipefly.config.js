export default {
  name: "pipefly",
  path: "/Users/brunoquaresma/pipelines",
  setup: {
    installNodeJS: "./pipeline/installNodeJS.sh",
    installGit: "./pipeline/installGit.sh",
  },
  source: {
    type: "git",
    url: "git@github.com:BrunoQuaresma/pipefly.git",
  },
  steps: {
    test: "npm test",
    deploy: {
      scripts: ["npm run deploy"],
      manual: true,
    },
  },
};
