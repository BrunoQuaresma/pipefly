export default {
  name: "mdapipe",
  setup: {
    installNodeJS: "./pipeline/installNodeJS.sh",
    installGit: "./pipeline/installGit.sh",
  },
  source: {
    type: "git",
    url: "",
  },
  steps: {
    test: "npm test",
    deploy: {
      scripts: ["npm run deploy"],
      manual: true,
    },
  },
};
