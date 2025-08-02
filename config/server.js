const express = require("express");
const app = express();

app.use(express.static("public")); // folder z Twoją stroną

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
