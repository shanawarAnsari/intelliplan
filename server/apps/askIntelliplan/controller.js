const fetch = require("node-fetch");
require("dotenv").config();
const agentUrl = process.env.AGENT_API_URL;
const agentController = {
  askAgent: async (req, res, next) => {
    // Dummy implementation: return a random answer
    const answers = [
      "Yes, that sounds good. I think it's a solid plan moving forward.",
      "I'm not sure about that, but you might want to try again with more details.",
      "Absolutely! This seems like the right direction to take.",
      "Nope, not today. Perhaps we can revisit this idea later.",
      "That could work, but let's consider the potential risks involved.",
      "Great idea! It aligns well with our current objectives.",
      "Hmm, I'm on the fence. Can you provide more context?",
      "Definitely not. There are better alternatives to explore.",
    ];
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    res.status(200).json({ message: randomAnswer });
  },
};

module.exports = agentController;
