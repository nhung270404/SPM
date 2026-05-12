const mongoose = require('mongoose');
const http = require('http');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/smart-spm');
  const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
  const p = await Project.findOne();
  if(!p) return console.log("No projects");

  const id = p._id.toString();
  console.log("Found project", id);
  http.get(`http://localhost:3000/api/projects/${id}/workitems`, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      process.exit(0);
    });
  });
}
test();
