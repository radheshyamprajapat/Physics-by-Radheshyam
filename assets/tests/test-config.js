window.TESTS = {
  "csir-net-mock-01": {
    id: "csir-net-mock-01",
    title: "CSIR NET Physical Sciences — Full Mock Test 01",
    exam: "CSIR NET",
    subject: "Physical Sciences",
    duration: 180,
    questionsFile: "assets/questions/csir-net-mock-01.js",
    sections: {
      A: { name: "Part A — General Aptitude", totalQuestions: 20, attemptLimit: 15, marks: 2, negative: 0.5 },
      B: { name: "Part B — Physical Sciences", totalQuestions: 25, attemptLimit: 20, marks: 3.5, negative: 0.875 },
      C: { name: "Part C — Physical Sciences", totalQuestions: 30, attemptLimit: 20, marks: 5, negative: 1.25 }
    }
  }
};
