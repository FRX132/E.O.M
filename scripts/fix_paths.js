/* global require, __dirname */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'components');

const fixFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    // using split and join for global replace without regex complexities
    content = content.split(search).join(replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

const fileReplacements = {
  'Agency/TripMode.jsx': [["from '../store'", "from '../../store'"]],
  'User/SkillTree.jsx': [["from '../store'", "from '../../store'"], ["from '../constants'", "from '../../constants'"]],
  'User/ExpenseTracker.jsx': [["from '../store'", "from '../../store'"]],
  'User/Auth.jsx': [["from '../store'", "from '../../store'"], ["from './Styles/", "from '../Styles/"]],
  'User/BigTargets.jsx': [["from '../store'", "from '../../store'"]],
  'Intelligence/BookList.jsx': [
    ["from '../store'", "from '../../store'"], 
    ["from './Styles/", "from '../Styles/"], 
    ["from './Agency/MediaModal'", "from '../Agency/MediaModal'"],
    ["from './MediaModal'", "from '../Agency/MediaModal'"]
  ],
  'Intelligence/GoalPlanner.jsx': [["from '../store'", "from '../../store'"], ["from '../constants'", "from '../../constants'"]],
  'Health/HabitTracker.jsx': [["from './Styles/", "from '../Styles/"]],
  'Health/WorkoutModal.jsx': [["from './Styles/", "from '../Styles/"]],
  'Agency/LanguageModal.jsx': [["from './Styles/", "from '../Styles/"]],
  'Agency/MediaModal.jsx': [["from './Styles/", "from '../Styles/"]],
  'User/Overview.jsx': [["from './Styles/", "from '../Styles/"]],
  'User/BigTargetModal.jsx': [["from './Styles/", "from '../Styles/"]],
  'Intelligence/GoalModal.jsx': [["from './Styles/", "from '../Styles/"]],
};

for (const [relPath, replacements] of Object.entries(fileReplacements)) {
  const fullPath = path.join(srcDir, relPath);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath, replacements);
  } else {
    console.log(`Not found: ${fullPath}`);
  }
}

// Global pass just in case we missed any './Styles' inside subfolders
const dirs = ['Agency', 'Functions', 'Health', 'Intelligence', 'User'];
dirs.forEach(d => {
  const dPath = path.join(srcDir, d);
  if (fs.existsSync(dPath)) {
    fs.readdirSync(dPath).forEach(file => {
      if (file.endsWith('.jsx')) {
        const p = path.join(dPath, file);
        let c = fs.readFileSync(p, 'utf8');
        let newC = c.replace(/from '\.\/Styles\//g, "from '../Styles/");
        if (newC !== c) {
           fs.writeFileSync(p, newC, 'utf8');
           console.log(`Updated global pass: ${p}`);
        }
      }
    });
  }
});

